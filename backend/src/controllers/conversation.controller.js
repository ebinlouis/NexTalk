import {
    getOrCreateDirectConversation,
    getUserConversations,
    getConversationById,
    getConversationMembers,
    createGroupConversation,
    addMembers,
    removeMember,
    leaveGroup,
    updateMemberRole,
    updateGroupSettings,
    markConversationAsRead,
} from '../services/conversation.service.js';
import { io, getReceiverSocketId } from '../lib/socket.js';

export const getOrCreateDirect = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const conversation = await getOrCreateDirectConversation(req.user._id, targetUserId);
        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error in getOrCreateDirect:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const conversations = await getUserConversations(req.user._id);
        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error in getConversations:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const getConversationDetails = async (req, res) => {
    try {
        const conversation = await getConversationById(req.params.id, req.user._id);
        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error in getConversationDetails:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const getMembers = async (req, res) => {
    try {
        const members = await getConversationMembers(req.params.id);
        res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.error('Error in getMembers:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds, avatar } = req.body;
        const group = await createGroupConversation(req.user._id, { name, description, memberIds, avatar });

        if (Array.isArray(memberIds)) {
            memberIds.forEach((mId) => {
                const socketId = getReceiverSocketId(mId.toString());
                if (socketId) io.to(socketId).emit('newConversation', group);
            });
        }

        res.status(201).json({ success: true, data: group });
    } catch (error) {
        console.error('Error in createGroup:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const addGroupMembers = async (req, res) => {
    try {
        const { memberIds } = req.body;
        const result = await addMembers(req.params.id, req.user._id, memberIds);

        io.to(req.params.id.toString()).emit('membersAdded', result);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in addGroupMembers:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const removeGroupMember = async (req, res) => {
    try {
        const result = await removeMember(req.params.id, req.user._id, req.params.userId);

        io.to(req.params.id.toString()).emit('memberRemoved', {
            conversationId: req.params.id,
            removedUserId: req.params.userId,
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in removeGroupMember:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const leaveGroupConversation = async (req, res) => {
    try {
        const result = await leaveGroup(req.params.id, req.user._id);

        io.to(req.params.id.toString()).emit('memberLeft', {
            conversationId: req.params.id,
            userId: req.user._id,
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in leaveGroupConversation:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        const result = await updateMemberRole(req.params.id, req.user._id, req.params.userId, role);

        io.to(req.params.id.toString()).emit('roleUpdated', result);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in updateRole:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const updated = await updateGroupSettings(req.params.id, req.user._id, req.body);

        io.to(req.params.id.toString()).emit('groupUpdated', updated);

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error in updateSettings:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const result = await markConversationAsRead(req.params.id, req.user._id);

        io.to(req.params.id.toString()).emit('conversationRead', result);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in markAsRead:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};
