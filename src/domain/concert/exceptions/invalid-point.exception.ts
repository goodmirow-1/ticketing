import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class InValidPointError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'invalid amount value', HttpStatus.BAD_REQUEST)
    }
}
