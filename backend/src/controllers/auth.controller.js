import { loginService, logoutService, signupService, refreshTokenService, saveRefreshTokenService } from '../services/auth.service.js';
import { generateAndSetTokens, verifyRefreshToken } from '../utils/jwt.js';

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
        const { refreshToken } = generateAndSetTokens(res, result.id);
        await saveRefreshTokenService(result.id, refreshToken);

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
        await logoutService(res, req.cookies.refreshToken);
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

export const checkAuth = async (req, res) => {
    try {
        const { _id, fullName, email, profilePic } = req.user;

        return res.status(200).json({
            success: true,
            message: 'User authenticated successfully',
            data: { id: _id, fullName, email, profilePic },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token provided' });
        const decoded = verifyRefreshToken(token);
        if (!decoded) return res.status(401).json({ message: 'Invalid or expired refresh token' });

        const { refreshToken: newRefreshToken } = generateAndSetTokens(res, decoded.userId);
        const result = await refreshTokenService(token, newRefreshToken);
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: result,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};
