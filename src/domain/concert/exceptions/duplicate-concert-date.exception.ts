import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class DuplicateConcertDateError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'ConcertDate is Duplicate', HttpStatus.CONFLICT)
    }
}
