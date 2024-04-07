export class NotFoundConcertError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Concert not found'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, NotFoundConcertError.prototype)
    }
}
