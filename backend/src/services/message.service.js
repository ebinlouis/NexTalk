import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import ConversationMember from '../models/conversationMember.model.js';
import CustomError from '../utils/error.js';

export const getAllContactsService = async (currentUserId) => {
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
        '-password -createdAt -updatedAt -__v',
    );
    return users;
};

export const sendMessageService = async (senderId, conversationId, messageData) => {
    const data = typeof messageData === 'object' && messageData !== null ? messageData : { text: messageData };
    const { text, image, fileUrl, fileName, fileType, fileSize } = data;

    if (!text && !image && !fileUrl) {
        throw new CustomError('Message content (text, image, or file) is required', 400);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new CustomError('Conversation not found', 404);
    }

    const member = await ConversationMember.findOne({ conversationId, userId: senderId });
    if (!member) {
        throw new CustomError('Access denied: You are not a member of this conversation', 403);
    }

    if (conversation.type === 'group' && conversation.permissions?.onlyAdminsCanPost) {
        if (member.role !== 'admin' && member.role !== 'creator') {
            throw new CustomError('Only administrators can post in this group', 403);
        }
    }

    const sender = await User.findById(senderId).select('fullName');

    const newMessage = await Message.create({
        conversationId,
        senderId,
        text: text || '',
        image: image || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
    });

    conversation.lastMessage = {
        text: text || (image ? '📷 Image' : '📎 Attachment'),
        senderId,
        senderName: sender?.fullName || 'User',
        createdAt: newMessage.createdAt,
    };
    await conversation.save();

    member.lastReadAt = new Date();
    await member.save();

    return newMessage;
};

export const getChattedUsersService = async (currentUserId) => {
    const userId = new mongoose.Types.ObjectId(currentUserId);

    const conversations = await Message.aggregate([
        { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: { $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'] },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$seen', false] }] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'partner' } },
        { $unwind: '$partner' },
        {
            $project: {
                _id: '$partner._id',
                fullName: '$partner.fullName',
                email: '$partner.email',
                profilePic: '$partner.profilePic',
                lastSeen: '$partner.lastSeen',
                lastMessage: {
                    text: '$lastMessage.text',
                    senderId: '$lastMessage.senderId',
                    createdAt: '$lastMessage.createdAt',
                },
                unreadCount: '$unreadCount',
            },
        },
        { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    return conversations;
};

export const getMessagesService = async (currentUserId, conversationId, { before, limit = 25 } = {}) => {
    const member = await ConversationMember.findOne({
        conversationId,
        userId: currentUserId,
    });

    if (!member) {
        throw new CustomError('Access denied: You are not a member of this conversation', 403);
    }

    member.lastReadAt = new Date();
    await member.save();

    const query = {
        conversationId,
        deletedBy: { $ne: currentUserId },
    };

    if (member.clearedHistoryAt) {
        query.createdAt = { $gt: member.clearedHistoryAt };
    }

    if (before) {
        const beforeDate = new Date(before);
        query.createdAt = query.createdAt
            ? { ...query.createdAt, $lt: beforeDate }
            : { $lt: beforeDate };
    }

    const messages = await Message.find(query)
        .populate('senderId', 'fullName profilePic')
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit) || 25, 50));

    return messages.reverse();
};

export const editMessageService = async (messageId, userId, newText) => {
    if (!newText?.trim()) throw new CustomError('Message text cannot be empty', 400);
    const message = await Message.findById(messageId);
    if (!message) throw new CustomError('Message not found', 404);
    if (message.senderId.toString() !== userId.toString()) {
        throw new CustomError('Unauthorized to edit this message', 403);
    }
    const editWindow = 15 * 60 * 1000;
    if (Date.now() - new Date(message.createdAt).getTime() > editWindow) {
        throw new CustomError('Editing window (15 minutes) has expired', 400);
    }
    message.text = newText.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();
    return message;
};

export const deleteMessageService = async (messageId, userId, deleteType = 'forEveryone') => {
    const message = await Message.findById(messageId);
    if (!message) throw new CustomError('Message not found', 404);
    if (deleteType === 'forEveryone') {
        if (message.senderId.toString() !== userId.toString()) {
            throw new CustomError('Unauthorized to delete for everyone', 403);
        }
        message.isDeletedForEveryone = true;
        message.text = 'This message was deleted';
        message.image = null;
        await message.save();
        return { message, deleteType: 'forEveryone' };
    }
    if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
        await message.save();
    }
    return { message, deleteType: 'forMe' };
};
