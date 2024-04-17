import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateUserUseCase } from '../../application/user/usecase/create-user.usecase'
import { ChargeUserPointUseCase } from '../../application/user/usecase/charge-user-point.usecase'
import { ReadUserPointUseCase } from '../../application/user/usecase/read-user-point.usecase'
import type { IUser } from 'src/domain/user/models/user.entity.interface'
import { ApiParam, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger'
import { ChargePointDto } from './dtos/charge-point.request.dto'
import { CreateUserDto } from './dtos/create-user.request.dto'

@ApiTags('유저 API')
@Controller('user')
export class UserController {
    constructor(
        private readonly chargePointUseCase: ChargeUserPointUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly readUserPointUseCase: ReadUserPointUseCase,
    ) {}

    @Get(':userId/point')
    @ApiOperation({
        summary: '포인트 조회',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '' })
    async getPoint(@Param('userId') userId: string): Promise<number> {
        return this.readUserPointUseCase.excute(userId)
    }

    @Patch('charge/:userId/point')
    @ApiOperation({
        summary: '포인트 충전',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '' })
    @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number', example: 100 } } } })
    async chargePoint(@Param('userId') userId: string, @Body() chargePointDto: ChargePointDto): Promise<number> {
        return this.chargePointUseCase.excute(userId, chargePointDto.amount)
    }

    @Post()
    @ApiOperation({
        summary: '생성',
    })
    @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'John Doe' } } } })
    async createUser(@Body() createUserDto: CreateUserDto): Promise<IUser> {
        return this.createUserUseCase.excute(createUserDto.name)
    }
}
