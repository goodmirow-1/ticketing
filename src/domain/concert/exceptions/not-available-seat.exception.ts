import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotAvailableSeatError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Not available seat', HttpStatus.BAD_REQUEST)
    }
}
