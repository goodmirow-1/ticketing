import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { GenerateTokenUseCase } from '../../application/user-waiting/usecase/generate-token.usecase'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetUser, JwtAuthGuard } from 'src/domain/common/jwt-token.util'

@ApiTags('유저 웨이팅 API')
@Controller('user-waiting')
export class UserWaitingController {
    constructor(
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly generateWaitingTokenUseCase: GenerateTokenUseCase,
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

    @Post(':userId/generateToken')
    @ApiOperation({
        summary: '토큰 발급',
    })
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string', nullable: true, default: '' } } } })
    @ApiResponse({ status: 200, description: 'Returns a new token | waiting for the user.' })
    async generateToken(@Param('userId') userId: string, @Body() body: { token?: string }): Promise<string | number> {
        if (body.token == undefined || body.token == '') {
            return this.generateTokenUseCase.excute(userId)
        } else {
            return this.generateWaitingTokenUseCase.excute(body.token)
        }
    }
}
