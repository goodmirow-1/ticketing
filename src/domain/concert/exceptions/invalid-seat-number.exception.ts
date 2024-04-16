import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class InValidSeatNumberError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'invalid seat number', HttpStatus.BAD_REQUEST)
    }
}
