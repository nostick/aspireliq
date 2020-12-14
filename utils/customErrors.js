class httpError extends Error {
    constructor(message, status) {
        super(message);

        const validStatus = Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
        this.message = message;
        this.status = validStatus || 500;
        this.error = { error: { message, status }};
    }
}

module.exports = {httpError};
