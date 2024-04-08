export class FailedUpdateSeatStatusError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Failed update seat status'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, FailedUpdateSeatStatusError.prototype)
    }
}
