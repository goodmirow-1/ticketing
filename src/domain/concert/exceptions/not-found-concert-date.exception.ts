import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotFoundConcertDateError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Concert date not found', HttpStatus.NOT_FOUND)
    }
}
