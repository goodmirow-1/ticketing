import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotFoundReservationError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Reservation not found', HttpStatus.NOT_FOUND)
    }
}
