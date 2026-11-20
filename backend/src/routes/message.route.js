import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getContacts, sendMessage, getChattedUsers, getMessages, editMessage, deleteMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/contacts', protectRoute, getContacts);
router.post('/send/:id', protectRoute, sendMessage);
router.get('/users', protectRoute, getChattedUsers);
router.get('/:id', protectRoute, getMessages);
router.put('/:id', protectRoute, editMessage);
router.delete('/:id', protectRoute, deleteMessage);

export default router;
