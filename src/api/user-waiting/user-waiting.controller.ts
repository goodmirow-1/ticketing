import { Controller, Get, Param, Post, UseGuards, Headers } from '@nestjs/common'
import { GenerateTokenUseCase } from '../../application/user-waiting/usecase/generate-token.usecase'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetUser, JwtAuthGuard } from '../../domain/common/jwt-token.util'
import { GenerateWaitingTokenUseCase } from 'src/application/user-waiting/usecase/generate-waiting-token.usecase'
import type { TokenResponseDto } from './dto/token-reponse.dto'

@ApiTags('유저 웨이팅 API')
@Controller('user-waiting')
export class UserWaitingController {
    constructor(
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly generateWaitingTokenUseCase: GenerateWaitingTokenUseCase,
    ) {}

    @Get()
    @ApiOperation({
        summary: '토큰 조회',
    })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async readToken(@GetUser() token: any): Promise<string> {
        return token
    }

    @Post(':userId/token/generate')
    @ApiOperation({
        summary: '토큰 발급',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns a new token or waiting number for the user.' })
    async generateToken(@Param('userId') userId: string): Promise<TokenResponseDto> {
        return this.generateTokenUseCase.excute(userId)
    }

    @Post('token/status')
    @ApiOperation({
        summary: '토큰 상태 조회',
    })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async checkTokenStatus(@GetUser('userId') userId: string) {
        return await this.generateWaitingTokenUseCase.excute(userId)
    }
}
