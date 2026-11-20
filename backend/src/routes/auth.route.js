import express from 'express';
import { login, logout, signup, checkAuth, refreshToken, updateProfile, updateAvatar } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';
import { signupSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/check', protectRoute, checkAuth);
router.put('/profile', protectRoute, validate(updateProfileSchema), updateProfile);
router.put('/profile/avatar', protectRoute, uploadAvatar, updateAvatar);

export default router;
