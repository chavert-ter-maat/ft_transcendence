import { IsNotEmpty } from 'class-validator';

export class VerifyTwoFADto {
	@IsNotEmpty()
	readonly email: string;

	@IsNotEmpty()
	readonly secretKey: string;

	@IsNotEmpty()
	readonly token: Boolean;
}