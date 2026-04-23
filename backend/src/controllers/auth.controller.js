import { loginService, logoutService, signupService } from '../services/auth.service.js';

export const signup = async (req, res) => {
    signupService();
};

export const login = async (req, res) => {
    loginService();
};

export const logout = async (req, res) => {
    logoutService();
};
