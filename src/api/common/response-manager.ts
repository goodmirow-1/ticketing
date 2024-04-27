import type { Response } from 'express'
import { HttpStatus } from '@nestjs/common'

export class ResponseManager {
    static from(response: Response, data: unknown, status: HttpStatus = HttpStatus.OK): void {
        response.status(status).json(data)
    }
}
