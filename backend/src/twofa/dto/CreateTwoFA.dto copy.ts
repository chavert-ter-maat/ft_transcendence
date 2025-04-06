import { IsAlphanumeric, IsNotEmpty, IsNumber } from 'class-validator';

export class createTwoFADto {
	@IsNotEmpty()
	readonly email: string;

	@IsNotEmpty()
	readonly secretKey: string;

	@IsNotEmpty()
	readonly token: string;
}