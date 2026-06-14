import User from '../models/user.model.js';
import CustomError from '../utils/error.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { clearTokensCookies } from '../utils/jwt.js';

export const signupService = async (data) => {
    const { fullName, email, password } = data;
    try {
        if (!fullName || !email || !password) {
            throw new CustomError('All Fields are required', 400);
        }

        if (password.length < 6) {
            throw new CustomError('Password must be at least 6 characters long', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new CustomError('User already exists', 409);

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            fullName: fullName,
            email: email,
            password: hashedPassword,
        });

        return {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        };
    } catch (error) {
        throw error;
    }
};

export const loginService = async (data) => {
    const { email, password } = data;
    try {
        if (!email || !password) {
            throw new CustomError('Email and password are required', 400);
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('Invalid credentials', 400);
        }

        const isPasswordCorrect = await comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            throw new CustomError('Invalid credentials', 400);
        }

        return {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        };
    } catch (error) {
        throw error;
    }
};

export const logoutService = (res) => {
    clearTokensCookies(res);
    return null;
};
