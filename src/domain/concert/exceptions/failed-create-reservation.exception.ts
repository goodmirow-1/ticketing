export class FailedCreateReservationError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Failed create reservation'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, FailedCreateReservationError.prototype)
    }
}
