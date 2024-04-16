import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class DuplicateReservationError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Reservation multiple unique is Duplicate', HttpStatus.CONFLICT)
    }
}
