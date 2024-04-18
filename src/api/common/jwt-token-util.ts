import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, createParamDecorator } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import type { Observable } from 'rxjs'

export const GetUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    return data ? user?.[data] : user
})

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const token = request.headers.authorization?.split(' ')[1] // Bearer 토큰에서 실제 토큰 추출

        if (!token) {
            return false
        }

        try {
            request.user = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}
