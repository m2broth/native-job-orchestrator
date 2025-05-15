class JobError extends Error {
    constructor(message) {
        super(message);
        this.name = 'JobError';
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

module.exports = { JobError, ValidationError };
