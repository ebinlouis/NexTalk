import { ENV } from '../lib/env.js';

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errorCode = err.errorCode || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

    const response = {
        success: false,
        message,
        error: {
            code: errorCode,
            ...(err.details && { details: err.details }),
        },
    };

    if (ENV.NODE_ENV !== 'production' && statusCode >= 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};