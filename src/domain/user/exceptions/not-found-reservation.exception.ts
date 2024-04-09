export class NotFoundReservationError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'User not found'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, NotFoundReservationError.prototype)
    }
}
