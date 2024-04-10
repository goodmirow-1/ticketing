import { Controller, Get, Param } from '@nestjs/common'
import { GenerateTokenUseCase } from './usecase/generate-token.usecase'
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('유저 웨이팅 API')
@Controller('user-waiting')
export class UserWaitingController {
    constructor(private readonly generateTokenUseCase: GenerateTokenUseCase) {}

    @Get(':userId/generateToken')
    @ApiParam({ name: 'userId', required: true, description: 'User ID', example: '6b9d7e44-04bf-4487-9777-faf55fb87b49' })
    @ApiResponse({ status: 200, description: 'Returns a new token | waiting for the user.' })
    async generateToken(@Param('userId') userId: string): Promise<string | number> {
        return this.generateTokenUseCase.excute(userId)
    }
}