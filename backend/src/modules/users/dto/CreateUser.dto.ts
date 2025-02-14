import { IsAlphanumeric, IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
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
		}, { message: "Password must be minimum 8 characters long consisting of lower, uppercase, numeric and special characters." }
	)
	@IsNotEmpty()
	readonly password: string;

	readonly secretKey: string;

	readonly isActiveTwoFa: boolean
}