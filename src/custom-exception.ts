import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, Logger } from '@nestjs/common'

export class CustomException extends HttpException {
    message: string
    statusCode: number
    data?: any

    constructor(message: string, statusCode: number, data?: any) {
        super(message, statusCode)
        this.message = message
        this.statusCode = statusCode
        this.data = data
    }
}

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
    private logger = new Logger('GlobalExceptionFilter')
    // unhandled 또한 처리 가능하도록 unknown Type 으로 receive
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const request = ctx.getRequest()
        const response = ctx.getResponse()

        // 예외가 HttpException이면 그 상태와 메시지를 사용하고, 그렇지 않으면 500
        const status = exception instanceof HttpException ? exception.getStatus() : 500
        const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

        // 로그에 추가 정보 포함
        const logFormat = `Error Response: ${request.method} ${request.url} ${status} ${JSON.stringify(message)}`
        this.logger.error(logFormat, exception.stack)

        // 클라이언트에게 응답 보내기
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        })
    }
}
