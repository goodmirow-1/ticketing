import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotFoundConcertError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Concert not found', HttpStatus.NOT_FOUND)
    }
}
