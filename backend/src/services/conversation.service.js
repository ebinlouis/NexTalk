import mongoose from 'mongoose';
import Conversation from '../models/conversation.model.js';
import ConversationMember from '../models/conversationMember.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import CustomError from '../utils/error.js';

export const getOrCreateDirectConversation = async (userAId, userBId) => {
    if (!userAId || !userBId) {
        throw new CustomError('Both user IDs are required to establish a direct conversation', 400);
    }

    if (userAId.toString() === userBId.toString()) {
        throw new CustomError('Cannot create a direct conversation with yourself', 400);
    }

    const userAConvs = await ConversationMember.find({ userId: userAId }).distinct('conversationId');

    if (userAConvs.length > 0) {
        const sharedMembers = await ConversationMember.find({
            userId: userBId,
            conversationId: { $in: userAConvs },
        }).lean();

        for (const member of sharedMembers) {
            const directConv = await Conversation.findOne({
                _id: member.conversationId,
                type: 'direct',
            });
            if (directConv) {
                return directConv;
            }
        }
    }

    const newConv = await Conversation.create({ type: 'direct' });

    await ConversationMember.create([
        { conversationId: newConv._id, userId: userAId, role: 'member' },
        { conversationId: newConv._id, userId: userBId, role: 'member' },
    ]);

    return newConv;
};

export const getUserConversations = async (userId) => {
    const memberships = await ConversationMember.find({ userId }).lean();
    if (!memberships.length) return [];

    const conversationIds = memberships.map((m) => m.conversationId);
    const conversations = await Conversation.find({ _id: { $in: conversationIds } })
        .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 })
        .lean();

    const memberMap = new Map();
    memberships.forEach((m) => memberMap.set(m.conversationId.toString(), m));

    const directConvIds = conversations.filter((c) => c.type === 'direct').map((c) => c._id);
    const partnerMembers = await ConversationMember.find({
        conversationId: { $in: directConvIds },
        userId: { $ne: userId },
    })
        .populate('userId', 'fullName profilePic status bio isOnline lastSeen')
        .lean();

    const partnerMap = new Map();
    partnerMembers.forEach((pm) => {
        partnerMap.set(pm.conversationId.toString(), pm.userId);
    });

    const groupConvIds = conversations.filter((c) => c.type === 'group').map((c) => c._id);
    const memberCounts = await ConversationMember.aggregate([
        { $match: { conversationId: { $in: groupConvIds } } },
        { $group: { _id: '$conversationId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map();
    memberCounts.forEach((mc) => countMap.set(mc._id.toString(), mc.count));

    const results = await Promise.all(
        conversations.map(async (conv) => {
            const mem = memberMap.get(conv._id.toString());
            const lastRead = mem?.lastReadAt || new Date(0);
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                createdAt: { $gt: lastRead },
                senderId: { $ne: userId },
            });

            if (conv.type === 'direct') {
                const partner = partnerMap.get(conv._id.toString());
                return {
                    ...conv,
                    unreadCount,
                    membershipRole: mem?.role || 'member',
                    partner: partner || null,
                    name: partner?.fullName || 'Direct Chat',
                    avatar: partner?.profilePic || null,
                };
            }

            return {
                ...conv,
                unreadCount,
                membershipRole: mem?.role || 'member',
                memberCount: countMap.get(conv._id.toString()) || 0,
            };
        })
    );

    return results;
};

export const getConversationById = async (conversationId, userId) => {
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) {
        throw new CustomError('Conversation not found', 404);
    }

    const membership = await ConversationMember.findOne({
        conversationId,
        userId,
    }).lean();

    if (!membership) {
        throw new CustomError('Access denied: Not a member of this conversation', 403);
    }

    if (conversation.type === 'direct') {
        const partnerMember = await ConversationMember.findOne({
            conversationId,
            userId: { $ne: userId },
        })
            .populate('userId', 'fullName profilePic status bio isOnline lastSeen')
            .lean();

        return {
            ...conversation,
            membershipRole: membership.role,
            partner: partnerMember?.userId || null,
            name: partnerMember?.userId?.fullName || 'Direct Chat',
            avatar: partnerMember?.userId?.profilePic || null,
        };
    }

    const memberCount = await ConversationMember.countDocuments({ conversationId });
    return {
        ...conversation,
        membershipRole: membership.role,
        memberCount,
    };
};

export const getConversationMembers = async (conversationId) => {
    const members = await ConversationMember.find({ conversationId })
        .populate('userId', 'fullName email profilePic status bio isOnline lastSeen')
        .sort({ role: 1, joinedAt: 1 })
        .lean();

    return members;
};

export const createGroupConversation = async (creatorId, { name, description, memberIds, avatar }) => {
    if (!name || !name.trim()) {
        throw new CustomError('Group name is required', 400);
    }

    if (name.trim().length > 60) {
        throw new CustomError('Group name cannot exceed 60 characters', 400);
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
        throw new CustomError('At least one member must be selected to create a group', 400);
    }

    const uniqueMemberIds = [
        ...new Set(
            memberIds
                .map((id) => id.toString())
                .filter((id) => id !== creatorId.toString() && mongoose.Types.ObjectId.isValid(id))
        ),
    ];

    if (uniqueMemberIds.length === 0) {
        throw new CustomError('At least one valid member other than creator is required', 400);
    }

    const newGroup = await Conversation.create({
        type: 'group',
        name: name.trim(),
        description: description ? description.trim().slice(0, 250) : null,
        avatar: avatar || null,
        creator: creatorId,
        permissions: {
            onlyAdminsCanPost: false,
            onlyAdminsCanEditInfo: true,
            onlyAdminsCanAddMembers: true,
        },
    });

    const memberDocs = [
        {
            conversationId: newGroup._id,
            userId: creatorId,
            role: 'creator',
            joinedAt: new Date(),
            lastReadAt: new Date(),
        },
        ...uniqueMemberIds.map((id) => ({
            conversationId: newGroup._id,
            userId: id,
            role: 'member',
            joinedAt: new Date(),
            lastReadAt: new Date(),
        })),
    ];

    await ConversationMember.insertMany(memberDocs);

    return {
        ...newGroup.toObject(),
        memberCount: memberDocs.length,
        membershipRole: 'creator',
    };
};

export const addMembers = async (conversationId, requesterId, newMemberIds) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
        throw new CustomError('Group conversation not found', 404);
    }

    const requesterMember = await ConversationMember.findOne({
        conversationId,
        userId: requesterId,
    });

    if (!requesterMember) {
        throw new CustomError('Access denied: You are not a member of this group', 403);
    }

    if (conversation.permissions?.onlyAdminsCanAddMembers) {
        if (requesterMember.role !== 'admin' && requesterMember.role !== 'creator') {
            throw new CustomError('Only admins can add members to this group', 403);
        }
    }

    if (!Array.isArray(newMemberIds) || newMemberIds.length === 0) {
        throw new CustomError('At least one member ID must be provided', 400);
    }

    const existingMembers = await ConversationMember.find({
        conversationId,
        userId: { $in: newMemberIds },
    }).distinct('userId');

    const existingSet = new Set(existingMembers.map((id) => id.toString()));
    const toAddIds = [
        ...new Set(
            newMemberIds
                .map((id) => id.toString())
                .filter((id) => !existingSet.has(id) && mongoose.Types.ObjectId.isValid(id))
        ),
    ];

    if (toAddIds.length === 0) {
        throw new CustomError('All selected users are already members of this group', 400);
    }

    const newDocs = toAddIds.map((id) => ({
        conversationId,
        userId: id,
        role: 'member',
        joinedAt: new Date(),
        lastReadAt: new Date(),
    }));

    await ConversationMember.insertMany(newDocs);

    const updatedMembers = await ConversationMember.find({ conversationId })
        .populate('userId', 'fullName email profilePic status bio isOnline lastSeen')
        .sort({ role: 1, joinedAt: 1 })
        .lean();

    return {
        conversationId,
        addedCount: toAddIds.length,
        members: updatedMembers,
    };
};

export const removeMember = async (conversationId, requesterId, targetUserId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
        throw new CustomError('Group conversation not found', 404);
    }

    const requesterMember = await ConversationMember.findOne({
        conversationId,
        userId: requesterId,
    });

    if (!requesterMember) {
        throw new CustomError('Access denied: You are not a member of this group', 403);
    }

    if (requesterMember.role !== 'admin' && requesterMember.role !== 'creator') {
        throw new CustomError('Only administrators can remove members', 403);
    }

    const targetMember = await ConversationMember.findOne({
        conversationId,
        userId: targetUserId,
    });

    if (!targetMember) {
        throw new CustomError('Member not found in this group', 404);
    }

    if (targetMember.role === 'creator') {
        throw new CustomError('The group creator cannot be removed', 400);
    }

    if (targetMember.role === 'admin' && requesterMember.role !== 'creator') {
        throw new CustomError('Only the group creator can remove administrators', 403);
    }

    await ConversationMember.deleteOne({ _id: targetMember._id });

    return {
        conversationId,
        removedUserId: targetUserId,
        message: 'Member removed successfully',
    };
};

export const leaveGroup = async (conversationId, userId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
        throw new CustomError('Group conversation not found', 404);
    }

    const membership = await ConversationMember.findOne({
        conversationId,
        userId,
    });

    if (!membership) {
        throw new CustomError('You are not a member of this group', 404);
    }

    if (membership.role === 'creator') {
        const remainingMembers = await ConversationMember.find({
            conversationId,
            userId: { $ne: userId },
        }).sort({ role: 1, joinedAt: 1 });

        if (remainingMembers.length === 0) {
            await ConversationMember.deleteOne({ _id: membership._id });
            await Conversation.deleteOne({ _id: conversationId });
            return {
                conversationId,
                archived: true,
                message: 'You left the group. The group was closed as no members remained.',
            };
        }

        const successor = remainingMembers[0];
        successor.role = 'creator';
        await successor.save();

        conversation.creator = successor.userId;
        await conversation.save();
    }

    await ConversationMember.deleteOne({ _id: membership._id });

    return {
        conversationId,
        userId,
        message: 'Successfully left the group',
    };
};

export const updateMemberRole = async (conversationId, requesterId, targetUserId, newRole) => {
    if (!['admin', 'member'].includes(newRole)) {
        throw new CustomError("Role must be either 'admin' or 'member'", 400);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
        throw new CustomError('Group conversation not found', 404);
    }

    const requesterMember = await ConversationMember.findOne({
        conversationId,
        userId: requesterId,
    });

    if (!requesterMember || requesterMember.role !== 'creator') {
        throw new CustomError('Only the group creator can promote or demote members', 403);
    }

    const targetMember = await ConversationMember.findOne({
        conversationId,
        userId: targetUserId,
    });

    if (!targetMember) {
        throw new CustomError('Member not found in this group', 404);
    }

    if (targetMember.role === 'creator') {
        throw new CustomError('Cannot change the role of the creator', 400);
    }

    targetMember.role = newRole;
    await targetMember.save();

    return {
        conversationId,
        targetUserId,
        newRole,
        message: `Member role successfully updated to ${newRole}`,
    };
};

export const updateGroupSettings = async (conversationId, requesterId, updateData) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
        throw new CustomError('Group conversation not found', 404);
    }

    const requesterMember = await ConversationMember.findOne({
        conversationId,
        userId: requesterId,
    });

    if (!requesterMember) {
        throw new CustomError('Access denied: Not a member of this group', 403);
    }

    if (conversation.permissions?.onlyAdminsCanEditInfo) {
        if (requesterMember.role !== 'admin' && requesterMember.role !== 'creator') {
            throw new CustomError('Only administrators can edit group info', 403);
        }
    }

    const { name, description, avatar, permissions } = updateData;

    if (name !== undefined) {
        if (!name.trim()) throw new CustomError('Group name cannot be empty', 400);
        conversation.name = name.trim().slice(0, 60);
    }

    if (description !== undefined) {
        conversation.description = description ? description.trim().slice(0, 250) : null;
    }

    if (avatar !== undefined) {
        conversation.avatar = avatar;
    }

    if (permissions && typeof permissions === 'object') {
        if (requesterMember.role === 'admin' || requesterMember.role === 'creator') {
            if (typeof permissions.onlyAdminsCanPost === 'boolean') {
                conversation.permissions.onlyAdminsCanPost = permissions.onlyAdminsCanPost;
            }
            if (typeof permissions.onlyAdminsCanEditInfo === 'boolean') {
                conversation.permissions.onlyAdminsCanEditInfo = permissions.onlyAdminsCanEditInfo;
            }
            if (typeof permissions.onlyAdminsCanAddMembers === 'boolean') {
                conversation.permissions.onlyAdminsCanAddMembers = permissions.onlyAdminsCanAddMembers;
            }
        }
    }

    await conversation.save();

    return conversation;
};

export const markConversationAsRead = async (conversationId, userId) => {
    const member = await ConversationMember.findOne({ conversationId, userId });
    if (!member) {
        throw new CustomError('Access denied: Not a member of this conversation', 403);
    }

    const now = new Date();
    member.lastReadAt = now;
    await member.save();

    return {
        conversationId,
        userId,
        lastReadAt: now,
    };
};
