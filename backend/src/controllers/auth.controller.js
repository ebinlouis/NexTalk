import { loginService, logoutService, signupService } from '../services/auth.service.js';
import { generateAndSetTokens } from '../utils/jwt.js';

export const signup = async (req, res) => {
    try {
        const result = await signupService(req.body);
        const { id, fullName, email, profilePic } = result;
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id, fullName, email, profilePic },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};

export const login = async (req, res) => {
    try {
        const result = await loginService(req.body);

        generateAndSetTokens(res, result.id);

        const { id, fullName, email, profilePic } = result;
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { id, fullName, email, profilePic },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};

export const logout = async (req, res) => {
    try {
        logoutService(res);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            data: null,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};
