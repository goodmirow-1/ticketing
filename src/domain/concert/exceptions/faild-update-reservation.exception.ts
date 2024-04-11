export class FailedUpdateReservationError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Failed update reservation'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, FailedUpdateReservationError.prototype)
    }
}
