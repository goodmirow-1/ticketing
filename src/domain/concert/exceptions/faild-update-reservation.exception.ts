import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class FailedUpdateReservationError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Failed update reservation', HttpStatus.NOT_FOUND)
    }
}
