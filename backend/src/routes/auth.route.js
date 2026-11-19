import express from 'express';
import { login, logout, signup, checkAuth, refreshToken } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/check', protectRoute, checkAuth);

export default router;
