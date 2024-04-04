import { Body, Controller, Get, Patch } from '@nestjs/common'

@Controller('user')
export class UserController {
    constructor() {}

    @Get('generateToken')
    async generateToken(): Promise<string> {
        return 'token'
    }

    @Get('point')
    async getPoint(): Promise<number> {
        return 100
    }

    @Patch('charge/point')
    async chargePoint(@Body('amount') amount: number): Promise<number> {
        return amount
    }
}
