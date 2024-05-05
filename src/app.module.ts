import { Module } from '@nestjs/common'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './api/user/user.module'
import { UserConcertWaitingModule } from './api/user-concert-waiting/user-concert-waiting.module'
import { ConcertModule } from './api/concert/concert.module'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_FILTER } from '@nestjs/core'
import { GlobalExceptionFilter } from './custom-exception'
import { AppService } from './app.service'
import { AppController } from './app.controller'
@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            useFactory: async () => {
                return {
                    type: process.env.DB_TYPE,
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USER_NAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DATABASE,
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                    logging: true,
                } as TypeOrmModuleOptions
            },
        }),
        UserModule,
        ConcertModule,
        UserConcertWaitingModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
