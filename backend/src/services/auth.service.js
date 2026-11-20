import User from '../models/user.model.js';
import CustomError from '../utils/error.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { clearTokensCookies, verifyRefreshToken, hashToken } from '../utils/jwt.js';

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

        const initials = fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();

        const newUser = await User.create({
            fullName: fullName,
            email: email,
            password: hashedPassword,
            profilePic: initials,
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

export const logoutService = async (res, refreshToken) => {
    clearTokensCookies(res);
    if (refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await User.updateOne({ 'refreshTokens.tokenHash': tokenHash }, { $pull: { refreshTokens: { tokenHash } } });
    }
    return null;
};

export const saveRefreshTokenService = async (userId, refreshToken) => {
    const tokenHash = hashToken(refreshToken);
    await User.findByIdAndUpdate(userId, { $push: { refreshTokens: { tokenHash } } });
};

export const refreshTokenService = async (refreshToken, newRefreshToken) => {
    if (!refreshToken) throw new CustomError('No refresh token provided', 401);
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new CustomError('Invalid or expired refresh token', 401);

    const user = await User.findById(decoded.userId);
    if (!user) throw new CustomError('User not found', 404);

    const incomingHash = hashToken(refreshToken);
    const tokenExists = user.refreshTokens?.some((t) => t.tokenHash === incomingHash);
    if (!tokenExists) {
        await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: [] } });
        throw new CustomError('Replay attack detected. All sessions revoked.', 401, 'TOKEN_REPLAY_DETECTED');
    }

    if (newRefreshToken) {
        const newHash = hashToken(newRefreshToken);
        user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== incomingHash);
        user.refreshTokens.push({ tokenHash: newHash });
        await user.save();
    }

    return { id: user._id, fullName: user.fullName, email: user.email, profilePic: user.profilePic };
};

export const updateProfileService = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    if (!user) throw new CustomError('User not found', 404);
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        status: user.status,
    };
};
