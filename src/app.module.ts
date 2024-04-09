import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './api/user/user.module'
import { UserConcertModule } from './api/user-concert/user-concert.module'
import { ConcertModule } from './api/concert/concert.module'
@Module({
    imports: [
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
        UserConcertModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
