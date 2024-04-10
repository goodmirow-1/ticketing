import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateUserUseCase } from './usecase/create-user.usecase'
import { ChargeUserPointUseCase } from './usecase/charge-user-point.usecase'
import { ReadUserPointUseCase } from './usecase/read-user-point.usecase'
import type { IUser } from 'src/domain/user/models/user.entity.interface'
import { ApiParam, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('유저 API')
@Controller('user')
export class UserController {
    constructor(
        private readonly chargePointUseCase: ChargeUserPointUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly readUserPointUseCase: ReadUserPointUseCase,
    ) {}

    @Get(':userId/point')
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns the point of the user.' })
    async getPoint(@Param('userId') userId: string): Promise<number> {
        return this.readUserPointUseCase.excute(userId)
    }

    @Patch('charge/:userId/point')
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number', example: 100 } } } })
    @ApiResponse({ status: 200, description: "Charges the user's point and returns the new point total." })
    async chargePoint(@Param('userId') userId: string, @Body('amount') amount: number): Promise<number> {
        return this.chargePointUseCase.excute(userId, amount)
    }

    @Post()
    @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'John Doe' } } } })
    @ApiResponse({ status: 201, description: 'Creates a new user and returns the user object.' })
    async createUser(@Body('name') name: string): Promise<IUser> {
        return this.createUserUseCase.excute(name)
    }
}
