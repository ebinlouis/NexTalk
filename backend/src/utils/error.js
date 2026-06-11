class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        Error.captureStackTree(this, this.constructor);
    }
}

export default CustomError;
