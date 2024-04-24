import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    getHealth(): string {
        return 'ecs connection is success'
    }
}
