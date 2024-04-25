import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { GenerateTokenUseCase } from '../../application/user-waiting/usecase/generate-token.usecase'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GenerateWaitingTokenUseCase } from 'src/application/user-waiting/usecase/generate-waiting-token.usecase'
import { GetUser, JwtAuthGuard } from '../common/jwt-token-util'
import { GenerateTokenCommand } from 'src/application/user-waiting/command/generate-token.command'
import type { ICommand } from 'src/application/common/command.interface'
import { GenerateWaitingTokenCommand } from 'src/application/user-waiting/command/generate-waiting-token.command'
import { ResponseManager } from '../common/response-manager'
import { Response } from 'express'
import type { GenerateWaitingTokenResponseDto } from 'src/application/user-waiting/dtos/generate.waiting-token.dto'
import type { GenerateTokenResponseDto } from 'src/application/user-waiting/dtos/generate-token.dto'

@ApiTags('유저 웨이팅 API')
@Controller('user-waiting')
export class UserWaitingController {
    constructor(
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly generateWaitingTokenUseCase: GenerateWaitingTokenUseCase,
    ) {}

    @Get('token/status')
    @ApiOperation({
        summary: '토큰 상태 조회',
    })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async checkTokenStatus(@GetUser('userId') userId: string, @Res() response: Response) {
        const command: ICommand<GenerateWaitingTokenResponseDto> = new GenerateWaitingTokenCommand(this.generateWaitingTokenUseCase, userId)
        ResponseManager.from(response, await command.execute())
    }

    @Get(':userId/token/generate')
    @ApiOperation({
        summary: '토큰 발급',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns a new token or waiting number for the user.' })
    async generateToken(@Param('userId') userId: string, @Res() response: Response) {
        const command: ICommand<GenerateTokenResponseDto> = new GenerateTokenCommand(this.generateTokenUseCase, userId)
        ResponseManager.from(response, await command.execute())
    }
}
