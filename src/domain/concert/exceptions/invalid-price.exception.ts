import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class InValidPriceError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'invalid price', HttpStatus.BAD_REQUEST)
    }
}
