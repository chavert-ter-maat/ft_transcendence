import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { User } from '../auth/auth.model';
import { TwoFADto } from './dto/TwoFA.dto';
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

@Injectable()
export class TwoFAService {
	async saveToDb(data): Promise<number> {
		console.log("create secret:", data)
		const user = await User.update({ twoFASecretKey: data.secretKey }, { where: { email: data.email } });
		console.log(user)
		if (user['affectedCount'] == 0) {
			throw new HttpException("secretKey could not be saved", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return user['affectedCount'];
	}


	async retrieveTwoFaSetup(data: TwoFADto): Promise<User> {
		return User.findOne({ where: { email: data.email } })
	}

	async generateTwoFaSecret(): Promise<object> {
		try {
			const secret = speakeasy.generateSecret()
			const url = speakeasy.otpauthURL({ secret: secret.ascii, label: "ft_transcendence" });
			const qrCodeUrl = await QRCode.toDataURL(url);
			return { secretKey: secret.base32, qrCodeUrl: qrCodeUrl };
		} catch (err) {
			console.error("Couldn't generate QR code, try again");
			throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
		}

	}

	async verifyTwoFa(data): Promise<any> {
		const identifiedUser = await User.findOne({ where: { email: data.email } });
		if (!identifiedUser) {
			throw new HttpException("Unauthorized user", HttpStatus.UNAUTHORIZED);
		}

		const isValidToken = speakeasy.totp.verify({
			secret: data.secretKey,
			encoding: 'base32',
			token: data.token,
		});

		if (isValidToken) { return { email: identifiedUser.email, secretKey: data.secretKey } }
		throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
	}

	async deleteTwoFAItem(user: TwoFADto): Promise<any> {
		const updateCount = await User.update({ twoFASecretKey: null }, { where: { email: user.email } });
		console.log(updateCount)
		if (!updateCount) {
			throw new HttpException("No user found to be deleted", HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
}