import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { GenerateTokenUseCase } from '../../application/user-waiting/usecase/generate-token.usecase'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GenerateWaitingTokenUseCase } from 'src/application/user-waiting/usecase/generate-waiting-token.usecase'
import type { TokenResponseDto } from './dtos/token-reponse.dto'
import { GetUser, JwtAuthGuard } from '../common/jwt-token-util'
import { GenerateTokenCommand } from 'src/application/user-waiting/command/generate-token.command'
import type { ICommand } from 'src/application/common/command.interface'
import { GenerateWaitingTokenCommand } from 'src/application/user-waiting/command/generate-waiting-token.command'

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
    async checkTokenStatus(@GetUser('userId') userId: string) {
        const command: ICommand<TokenResponseDto | number> = new GenerateWaitingTokenCommand(this.generateWaitingTokenUseCase, userId)
        return command.execute()
    }

    @Get(':userId/token/generate')
    @ApiOperation({
        summary: '토큰 발급',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns a new token or waiting number for the user.' })
    async generateToken(@Param('userId') userId: string): Promise<TokenResponseDto> {
        const command: ICommand<TokenResponseDto> = new GenerateTokenCommand(this.generateTokenUseCase, userId)
        return command.execute()
    }
}
