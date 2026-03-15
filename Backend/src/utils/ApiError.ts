class ApiError extends Error{
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        // Set the prototype explicitly to maintain the correct prototype chain
        Object.setPrototypeOf(this, ApiError.prototype);
        this.name ='ApiError';
    }
}

export default ApiError;