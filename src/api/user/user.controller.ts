import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common'
import { CreateUserUseCase } from '../../application/user/usecase/create-user.usecase'
import { ChargeUserPointUseCase } from '../../application/user/usecase/charge-user-point.usecase'
import { ReadUserPointUseCase } from '../../application/user/usecase/read-user-point.usecase'
import { ApiParam, ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
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
import { GenerateTokenUseCase } from 'src/application/user/usecase/generate-token.usecase'
import type { GenerateTokenResponseDto } from 'src/application/user/dtos/generate-token.dto'
import { GenerateTokenCommand } from 'src/application/user/command/generate-token.command'
import type { CheckWaitingResponseDto } from 'src/application/user/dtos/check-waiting.dto'
import { CheckWaitingUseCase } from 'src/application/user/usecase/check-waiting.usecase'
import { CheckWaitingCommand } from 'src/application/user/command/check-waiting.command'
import { CheckWaitingDto } from './dtos/check-waiting.request.dto'

@ApiTags('유저 API')
@Controller('user')
export class UserController {
    constructor(
        private readonly chargePointUseCase: ChargeUserPointUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly readUserPointUseCase: ReadUserPointUseCase,
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly checkWaitingUseCase: CheckWaitingUseCase,
    ) {}

    @Get(':userId/token/generate')
    @ApiOperation({
        summary: '토큰 발급',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '' })
    @ApiResponse({ status: 200, description: 'Returns a new token or waiting number for the user.' })
    async generateToken(@Param('userId') userId: string, @Res() response: Response) {
        const command: ICommand<GenerateTokenResponseDto> = new GenerateTokenCommand(this.generateTokenUseCase, userId)
        ResponseManager.from(response, await command.execute())
    }

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

    @Post(':userId/check/waiting')
    @ApiOperation({
        summary: '대기 확인',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '' })
    @ApiBody({ schema: { type: 'object', properties: { waitingNumber: { type: 'number', example: 1 } } } })
    @ApiResponse({ status: 200, description: 'Returns a new token or waiting number for the user.' })
    async checkWaiting(@Param('userId') userId: string, @Body() checkWaitingDto: CheckWaitingDto, @Res() response: Response) {
        const command: ICommand<CheckWaitingResponseDto> = new CheckWaitingCommand(this.checkWaitingUseCase, userId, checkWaitingDto.waitingNumber)
        ResponseManager.from(response, await command.execute())
    }
}
