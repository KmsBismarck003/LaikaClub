/**
 * ApiError - Custom error class for API related errors
 * Ensures meaningful string representation and preserved stack trace
 */
export class ApiError extends Error {
    constructor({ status, message, data }) {
        super(message || 'Error en la petición API');
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
        
        // Mantener el stack trace en V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Devuelve una representación legible del error
     */
    toString() {
        return `${this.name} (${this.status}): ${this.message}`;
    }
}

export default ApiError;
