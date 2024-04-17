import { IsString, Length } from 'class-validator'

export class CreateUserDto {
    @IsString()
    @Length(2, 100) // 이름 길이는 2에서 100자 사이
    name: string
}
