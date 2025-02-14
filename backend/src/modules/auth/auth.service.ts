import { BadRequestException, HttpException, HttpStatus, Injectable, MaxFileSizeValidator } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { speakeasy } from 'speakeasy';
import { TwoFADto } from '../twofa/dto/TwoFA.dto';
import { TwoFaStrategy } from './twofa.strategy';
import { LoginUserDto } from '../users/dto/LoginUser.dto';
import { CreateContextOptions } from 'vm';
import { CreateUserDto } from '../users/dto/CreateUser.dto';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TwoFAService } from '../twofa/twofa.service';
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly twoFAService: TwoFAService,
		private readonly jwtService: JwtService,
	) { }

	async validateUser(username: string, pass: string) {
		// find if user exist with this email
		const user = await this.userService.findOneByEmail(username);
		if (!user) {
			return null;
		}

		// find if user password match
		const match = await this.comparePassword(pass, user.password);
		if (!match) {
			return null;
		}

		// tslint:disable-next-line: no-string-literal
		const { password, ...result } = user['dataValues'];
		return result;
	}

	public async login(user: LoginUserDto) {
		console.log("this is happening:", user)
		const token = await this.generateToken(user);
		return { user, token };
	}

	public async create(user: CreateUserDto) {
		// hash the password
		const pass = await this.hashPassword(user.password);

		// create the user

		try {
			const newUser = await this.userService.create({ ...user, password: pass });
			// tslint:disable-next-line: no-string-literal
			const { password, ...result } = newUser['dataValues'];

			// generate token
			const token = await this.generateToken(result);

			// return the user and the token
			return { user: result, token };
		} catch (error) {
			if (error.name == "SequelizeUniqueConstraintError") {
				throw new HttpException(error.original.detail, HttpStatus.BAD_REQUEST)
			}
			else {
				throw new HttpException(error, HttpStatus.BAD_REQUEST)
			}
		}

	}

	private async generateToken(user) {
		const token = await this.jwtService.signAsync(user);
		return token;
	}

	private async hashPassword(password) {
		const hash = await bcrypt.hash(password, 10);
		return hash;
	}

	private async comparePassword(enteredPassword, dbPassword) {
		const match = await bcrypt.compare(enteredPassword, dbPassword);
		return match;
	}

	async generateTwoFaSecret(user: TwoFADto): Promise<void> {
		const secret = speakeasy.generateSecret()
		const updateCount = await this.twoFAService.updateTwoFaSecret(user.email, secret.base32);

		if (!updateCount) {
			return null;
		}
		const url = speakeasy.otpauthURL({ secret: secret.ascii, label: `ft_transcendence: ${user.email}` });

		console.log(url)

		try {
			const qrCodeUrl = await QRCode.toDataURL(url);
			return qrCodeUrl;
		} catch (err) {
			console.error("error:", err);
			return null;
		}

	}

	async deleteTwoFaSecret(user: TwoFADto): Promise<[number]> {
		const updateCount = await this.twoFAService.resetTwoFaSecret(user.email);
		return updateCount;
	}

	async verifyTwoFa(user: TwoFADto): Promise<any> {
		const identifiedUser = await this.userService.findOneByEmail(user.email);
		if (!identifiedUser) {
			console.log("User is not validated");
			return null;
		} else if (!identifiedUser.secretKey) {
			console.log("2fa secret key is not set");
			return null;
		}
		else if (!identifiedUser.isActiveTwoFa) {
			console.log("2fa is disabled");
			return null;
		}

		const isValidToken = speakeasy.totp.verify({
			secret: identifiedUser.secretKey,
			encoding: 'base32',
			token: user.token,
		});

		if (isValidToken) {
			return identifiedUser;
		}
		return null;
	}

	async enableTwoFa(user: TwoFADto): Promise<any> {
		const updateCount = await this.twoFAService.updateIsActiveTwoFa(user.email, true);
		console.log("update count:", updateCount)
		return updateCount
	}

	async disableTwoFa(user: TwoFADto): Promise<any> {
		const updateCount = await this.twoFAService.updateIsActiveTwoFa(user.email, false);
		return updateCount
	}
}