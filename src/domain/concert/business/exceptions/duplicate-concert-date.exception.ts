export class DuplicateConcertDateError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'ConcertDate is Duplicate'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, DuplicateConcertDateError.prototype)
    }
}
