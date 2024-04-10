export class InValidSeatNumberError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'invalid seat number'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, InValidSeatNumberError.prototype)
    }
}
