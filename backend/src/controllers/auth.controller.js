import { loginService, logoutService, signupService } from '../services/auth.service.js';

export const signup = async (req, res) => {
    try {
        const result = await signupService(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const login = async (req, res) => {
    loginService();
};

export const logout = async (req, res) => {
    logoutService();
};
