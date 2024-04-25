import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common'
import { CreateUserUseCase } from '../../application/user/usecase/create-user.usecase'
import { ChargeUserPointUseCase } from '../../application/user/usecase/charge-user-point.usecase'
import { ReadUserPointUseCase } from '../../application/user/usecase/read-user-point.usecase'
import { ApiParam, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger'
import { ChargePointDto } from './dtos/charge-point.request.dto'
import { CreateUserDto } from './dtos/create-user.request.dto'
import type { ICommand } from 'src/application/common/command.interface'
import { ReadUserPointCommand } from 'src/application/user/command/read-user-point.command'
import { ChargeUserPointCommand } from 'src/application/user/command/charge-user-point.command'
import { CreateUserCommand } from 'src/application/user/command/create-user.command'
import { ResponseManager } from '../common/response-manager'
import { Response } from 'express'
import type { ReadUserPointResponseDto } from 'src/application/user/dtos/read-user-point.dto'
import type { ChargeUserPointResponseDto } from 'src/application/user/dtos/charge-user-point.dto'
import type { CreateUserResponseDto } from 'src/application/user/dtos/create-user.dto'

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
    async getPoint(@Param('userId') userId: string, @Res() response: Response) {
        const command: ICommand<ReadUserPointResponseDto> = new ReadUserPointCommand(this.readUserPointUseCase, userId)
        ResponseManager.from(response, await command.execute())
    }

    @Patch('charge/:userId/point')
    @ApiOperation({
        summary: '포인트 충전',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '' })
    @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number', example: 100 } } } })
    async chargePoint(@Param('userId') userId: string, @Body() chargePointDto: ChargePointDto, @Res() response: Response) {
        const command: ICommand<ChargeUserPointResponseDto> = new ChargeUserPointCommand(this.chargePointUseCase, userId, chargePointDto.amount)
        ResponseManager.from(response, await command.execute())
    }

    @Post()
    @ApiOperation({
        summary: '생성',
    })
    @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'John Doe' } } } })
    async createUser(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
        const command: ICommand<CreateUserResponseDto> = new CreateUserCommand(this.createUserUseCase, createUserDto.name)
        ResponseManager.from(response, await command.execute())
    }
}
