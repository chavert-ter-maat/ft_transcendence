import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { User } from '../auth/auth.model';
import { TwoFADto } from './dto/TwoFA.dto';
const Cryptr = require('cryptr');

const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

@Injectable()
export class TwoFAService {
	async saveToDb(data): Promise<User> {
		try {
			console.log("create secret:", data)
			const user = await User.findOne({ where: { email: data.email } });

			console.log("userid", `ft_transcendence_${user.userId}`)
			console.log("secretkey", data.secretKey)

			const cryptr = new Cryptr(`ft_transcendence_${user.userId}`);
			const encryptedSecretKey = cryptr.encrypt(data.secretKey);

			console.log("encrypted key:", encryptedSecretKey)
			await user.update({ twoFASecretKey: encryptedSecretKey });
			return user;
		} catch (e) {
			throw new HttpException(`secretKey could not be saved: ${e} `, HttpStatus.INTERNAL_SERVER_ERROR);
		}
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

	async validateTwoFA(data): Promise<any> {
		const isValidToken = speakeasy.totp.verify({
			secret: data.secretKey,
			encoding: 'base32',
			token: data.token,
		});
		console.log("is valid token", isValidToken)
		if (isValidToken) {
			return isValidToken;
		}
		throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
	}


	async validateTwoFAFirstTime(data): Promise<any> {
		const user = await User.findOne({ where: { sessionId: data.sessionId } });

		if (user) {
			const cryptr = new Cryptr(`ft_transcendence_${user.userId}`);
			const decryptedSecretKey = cryptr.decrypt(user.twoFASecretKey);
			const isValidToken = speakeasy.totp.verify({
				secret: decryptedSecretKey,
				encoding: 'base32',
				token: data.token,
			});

			if (isValidToken) {
				await user.update({ sessionId: null })
				return user;
			}
			throw new HttpException("invalid token", HttpStatus.UNAUTHORIZED);
		}
		throw new HttpException("Invalid sessionId", HttpStatus.UNAUTHORIZED);
	}

	async deleteTwoFAItem(user: TwoFADto): Promise<any> {
		console.log("user to be deleted: ", user)
		const updateCount = await User.update({ twoFASecretKey: null }, { where: { email: user.email } });
		console.log(updateCount)
		if (!updateCount) {
			throw new HttpException("No user found to be deleted", HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
}