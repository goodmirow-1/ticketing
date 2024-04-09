import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateUserUseCase } from './usecase/create-user.usecase'
import { ChargeUserPointUseCase } from './usecase/charge-user-point.usecase'
import { GenerateTokenUseCase } from './usecase/generate-token.usecase'
import { ReadUserPointUseCase } from './usecase/read-user-point.usecase'
import type { IUser } from 'src/domain/user/models/user.entity.interface'

@Controller('user')
export class UserController {
    constructor(
        private readonly chargePointUseCase: ChargeUserPointUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly readUserPointUseCase: ReadUserPointUseCase,
    ) {}

    @Get(':userId/point')
    async getPoint(@Param('userId') userId: string): Promise<number> {
        return this.readUserPointUseCase.excute(userId)
    }

    @Get(':userId/generateToken')
    async generateToken(@Param('userId') userId: string): Promise<string> {
        return this.generateTokenUseCase.excute(userId)
    }

    @Patch('charge/:userId/point')
    async chargePoint(@Param('userId') userId: string, @Body('amount') amount: number): Promise<number> {
        return this.chargePointUseCase.excute(userId, amount)
    }

    @Post()
    async createUser(@Body('name') name: string): Promise<IUser> {
        return this.createUserUseCase.excute(name)
    }
}
