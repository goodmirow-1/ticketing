export class FailedUserChargePointError extends Error {
    constructor(msg?: string) {
        const message = msg ?? 'Failed user charge point'
        super(message)
        this.message = message
        Object.setPrototypeOf(this, FailedUserChargePointError.prototype)
    }
}
