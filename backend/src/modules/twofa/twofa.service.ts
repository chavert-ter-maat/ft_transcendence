import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { TwoFA } from './twofa.entity';
import { TWOFA_REPOSITORY } from '../../core/constants';
import { UsersService } from '../users/users.service';
import { ConditionalModule } from '@nestjs/config';
import { TwoFADto } from './dto/TwoFA.dto';
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

@Injectable()
export class TwoFAService {

	constructor(
		@Inject(TWOFA_REPOSITORY) private readonly TwoFARepository: typeof TwoFA,
		private readonly userService: UsersService,
	) { }

	async saveToDb(data): Promise<TwoFADto> {
		console.log("create secret:", data)
		const savedItem = await this.TwoFARepository.create({ ...data });
		console.log(savedItem)
		return savedItem
	}


	async retrieveTwoFaSetup(data: TwoFADto): Promise<TwoFA> {
		return this.TwoFARepository.findOne({ where: { email: data.email } })
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
		const identifiedUser = await this.userService.findOneByEmail(data.email);
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
		const updateCount = await this.TwoFARepository.destroy({ where: { email: user.email } });
		console.log(updateCount)
		if (!updateCount) {
			throw new HttpException("No user found to be deleted", HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
}