import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { verifyConversationMember } from '../middleware/conversation.middleware.js';
import {
    getOrCreateDirect,
    getConversations,
    getConversationDetails,
    getMembers,
    createGroup,
    addGroupMembers,
    removeGroupMember,
    leaveGroupConversation,
    updateRole,
    updateSettings,
    markAsRead,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.use(protectRoute);

router.post('/direct', getOrCreateDirect);
router.get('/', getConversations);
router.post('/groups', createGroup);

router.get('/:id', verifyConversationMember, getConversationDetails);
router.get('/:id/members', verifyConversationMember, getMembers);
router.post('/:id/members', verifyConversationMember, addGroupMembers);
router.delete('/:id/members/:userId', verifyConversationMember, removeGroupMember);
router.post('/:id/leave', verifyConversationMember, leaveGroupConversation);
router.patch('/:id/members/:userId/role', verifyConversationMember, updateRole);
router.patch('/:id', verifyConversationMember, updateSettings);
router.post('/:id/read', verifyConversationMember, markAsRead);

export default router;
