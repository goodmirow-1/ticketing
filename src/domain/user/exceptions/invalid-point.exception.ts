export class InValidPointError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'invalid point'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, InValidPointError.prototype)
    }
}
