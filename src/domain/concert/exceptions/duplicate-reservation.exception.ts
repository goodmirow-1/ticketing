export class DuplicateReservationError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Reservation multiple unique is Duplicate'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, DuplicateReservationError.prototype)
    }
}
