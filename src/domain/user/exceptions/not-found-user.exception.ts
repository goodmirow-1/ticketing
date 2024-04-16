import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class NotFoundUserError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'User not found', HttpStatus.NOT_FOUND)
    }
}
