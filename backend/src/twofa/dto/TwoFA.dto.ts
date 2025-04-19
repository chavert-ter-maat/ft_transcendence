import { IsNotEmpty } from 'class-validator';

export class TwoFADto {
	@IsNotEmpty()
	readonly email: string;

	@IsNotEmpty()
	readonly secretKey: string;
}