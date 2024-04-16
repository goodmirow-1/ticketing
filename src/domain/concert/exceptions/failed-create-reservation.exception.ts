import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class FailedCreateReservationError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Failed create reservation', HttpStatus.BAD_REQUEST)
    }
}
