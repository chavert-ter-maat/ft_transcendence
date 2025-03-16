import { IsNotEmpty } from 'class-validator';

export class VerifyTwoFADto {
	readonly secretKey: string;

	readonly sessionId: string;

	@IsNotEmpty()
	readonly token: Boolean;
}