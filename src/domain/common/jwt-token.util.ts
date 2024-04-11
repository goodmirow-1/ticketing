import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, createParamDecorator } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import type { Observable } from 'rxjs'

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

export function generateAccessToken(userId: string, expiration: number, waitingNumber: number): string {
    return jwt.sign(
        {
            userId: userId,
            waitingNumber: waitingNumber,
            exp: expiration,
        },
        `${process.env.JWT_SECRET_KEY}`,
    )
}

export function extractToken(token: string) {
    const decodedToken = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`) as {
        userId: string
        waitingNumber: number
        exp: number
    }

    return { userId: decodedToken.userId, waitingNumber: decodedToken.waitingNumber }
}

export const GetUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    return data ? user?.[data] : user
})
