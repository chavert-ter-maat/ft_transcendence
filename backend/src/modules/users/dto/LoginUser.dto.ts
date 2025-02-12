import { IsAlpha, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
	@IsNotEmpty()
	@IsAlpha()
	readonly email: string;

	@IsNotEmpty()
	readonly password: string;
}