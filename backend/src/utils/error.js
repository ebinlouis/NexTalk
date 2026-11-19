class CustomError extends Error {
    constructor(message, statusCode = 500, errorCode = 'ERROR', details = null) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;
