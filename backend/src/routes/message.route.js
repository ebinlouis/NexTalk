import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getContacts, sendMessage, getChattedUsers, getMessages } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/contacts', protectRoute, getContacts);
router.post('/send/:id', protectRoute, sendMessage);
router.get('/users', protectRoute, getChattedUsers);
router.get('/:id', protectRoute, getMessages);

export default router;
