import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
	@IsNotEmpty()
	@IsString()
	readonly name: string;

	@IsEmail()
	@IsNotEmpty()
	readonly email: string;

	@IsNotEmpty()
	readonly password: string;
	readonly secretKey: string;
}