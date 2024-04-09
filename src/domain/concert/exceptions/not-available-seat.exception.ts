export class NotAvailableSeatError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Not available seat'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, NotAvailableSeatError.prototype)
    }
}
