import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getContacts } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/contacts', protectRoute, getContacts);

export default router;
