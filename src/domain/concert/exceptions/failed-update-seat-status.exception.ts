import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class FailedUpdateSeatStatusError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Failed update seat status', HttpStatus.NOT_FOUND)
    }
}
