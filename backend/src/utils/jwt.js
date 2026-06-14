import jwt from 'jsonwebtoken';
import { ENV } from '../lib/env.js';

// Token generation helpers
export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
};

// Token verification helpers
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};

// Cookie handling helpers
export const sendTokensAsCookies = (res, accessToken, refreshToken) => {
    const isProduction = ENV.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const generateAndSetTokens = (res, userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    sendTokensAsCookies(res, accessToken, refreshToken);

    return { accessToken, refreshToken };
};

export const clearTokensCookies = (res) => {
    const isProduction = ENV.NODE_ENV === 'production';

    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        expires: new Date(0),
    });

    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        expires: new Date(0),
    });
};
