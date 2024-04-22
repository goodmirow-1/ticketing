import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle('티케팅 API 문서')
        .setDescription('concert ticketing')
        .setVersion('0.0.1')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'JWT 토큰을 입력하세요',
                in: 'header',
            },
            'access-token', // Swagger UI가 참조하는 중요한 이름입니다.
        )
        .build()

    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-docs', app, document)
    
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const server = app.getHttpAdapter().getInstance()

    server.maxConnections = Infinity

    setupSwagger(app)
    await app.listen(3000)
}
bootstrap()
