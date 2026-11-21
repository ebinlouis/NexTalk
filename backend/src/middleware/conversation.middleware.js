import mongoose from 'mongoose';
import ConversationMember from '../models/conversationMember.model.js';
import Conversation from '../models/conversation.model.js';

export const verifyConversationMember = async (req, res, next) => {
    try {
        const conversationId = req.params.id || req.params.conversationId || req.body.conversationId;

        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid or missing conversation ID' });
        }

        const member = await ConversationMember.findOne({
            conversationId,
            userId: req.user._id,
        });

        if (!member) {
            return res.status(403).json({ message: 'Access denied: You are not a member of this conversation' });
        }

        req.conversationId = conversationId;
        req.membership = member;
        next();
    } catch (error) {
        console.error('Error in verifyConversationMember middleware:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const requireGroupAdmin = (req, res, next) => {
    if (!req.membership || (req.membership.role !== 'admin' && req.membership.role !== 'creator')) {
        return res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    }
    next();
};

export const checkGroupPostPermission = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (conversation.type === 'group' && conversation.permissions?.onlyAdminsCanPost) {
            if (req.membership.role !== 'admin' && req.membership.role !== 'creator') {
                return res.status(403).json({ message: 'Only administrators are allowed to post in this group' });
            }
        }

        req.conversation = conversation;
        next();
    } catch (error) {
        console.error('Error in checkGroupPostPermission middleware:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
