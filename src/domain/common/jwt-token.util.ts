import * as jwt from 'jsonwebtoken'

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
