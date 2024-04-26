import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotAuthReservationError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'do not have auth reservation', HttpStatus.NOT_FOUND)
    }
}
