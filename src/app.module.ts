import { Module } from '@nestjs/common'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './api/user/user.module'
import { UserConcertWaitingModule } from './api/user-concert-waiting/user-concert-waiting.module'
import { ConcertModule } from './api/concert/concert.module'
import { ScheduleModule } from '@nestjs/schedule'
import { UserWaitingModule } from './api/user-waiting/user-waiting.module'
import { WaitingModule } from './api/waiting/waiting.module'
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
        WaitingModule,
        UserConcertWaitingModule,
        UserWaitingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
