import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { GenerateTokenUseCase } from './usecase/generate-token.usecase'
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'
import { GetUser, JwtAuthGuard } from 'src/domain/common/jwt-token.util'

@Controller('user-waiting')
export class UserWaitingController {
    constructor(private readonly generateTokenUseCase: GenerateTokenUseCase) {}

    @Get('wait-number')
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns the wait number of the user.' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    getWaitNumber(@GetUser('waitNumber') waitNumber: number): number {
        return waitNumber
    }

    @Get(':userId/generateToken')
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns a new token | waiting for the user.' })
    async generateToken(@Param('userId') userId: string): Promise<string | number> {
        return this.generateTokenUseCase.excute(userId)
    }
}
