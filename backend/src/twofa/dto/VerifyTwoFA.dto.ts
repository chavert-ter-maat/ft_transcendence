import { IsNotEmpty } from 'class-validator';

export class VerifyTwoFADto {
	@IsNotEmpty()
	readonly secretKey: string;

	@IsNotEmpty()
	readonly token: Boolean;
}