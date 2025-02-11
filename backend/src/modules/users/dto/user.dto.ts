import { IsAlphanumeric, IsEmail, IsNotEmpty, IsStrongPassword, Length, Matches } from 'class-validator';

export class UserDto {
	@IsAlphanumeric()
	@IsNotEmpty()
	readonly username: string;

	@IsEmail()
	@IsNotEmpty()
	readonly email: string;

	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minNumbers: 1,
			minSymbols: 1,
			minUppercase: 1
		}
	)
	@IsNotEmpty()
	readonly password: string;

	readonly secretKey: string;

	readonly isActiveTwoFa: boolean
}