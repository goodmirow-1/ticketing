import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotFoundSeatError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Seat not found', HttpStatus.NOT_FOUND)
    }
}
