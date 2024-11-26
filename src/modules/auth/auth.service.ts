import { Injectable, MaxFileSizeValidator } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { speakeasy } from 'speakeasy';
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
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

	public async login(user) {
		const token = await this.generateToken(user);
		return { user, token };
	}

	public async create(user) {
		// hash the password
		const pass = await this.hashPassword(user.password);

		// create the user
		const newUser = await this.userService.create({ ...user, password: pass });

		// tslint:disable-next-line: no-string-literal
		const { password, ...result } = newUser['dataValues'];

		// generate token
		const token = await this.generateToken(result);

		// return the user and the token
		return { user: result, token };
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

	async generateTwoFaSecret(email: string): Promise<void> {
		const secret = speakeasy.generateSecret()
		const updateCount = await this.userService.updateTwoFaSecret(email, secret.base32);

		if (!updateCount) {
			return null;
		}

		const url = speakeasy.otpauthURL({ secret: secret.ascii, label: `ft_transcendence: ${email}` });

		console.log(url)

		try {
			const qrCodeUrl = await QRCode.toDataURL(url);
			return qrCodeUrl;
		} catch (err) {
			console.error("error:", err);
			return null;
		}

	}

	async deleteTwoFaSecret(email: string): Promise<[number]> {
		const updateCount = await this.userService.resetTwoFaSecret(email);
		return updateCount;
	}

	async verifyTwoFa(email: string, token: string): Promise<any> {
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			console.log("User is not validated");
			return null;
		} else if (!user.secretKey) {
			console.log("2fa secret key is not set");
			return null;
		}
		else if (!user.isActiveTwoFa) {
			console.log("2fa is disabled");
			return null;
		}

		const isValidToken = speakeasy.totp.verify({
			secret: user.secretKey,
			encoding: 'base32',
			token: token,
		});

		if (isValidToken) {
			return user;
		}
		return null;
	}

	async enableTwoFa(email: string): Promise<any> {
		const updateCount = await this.userService.updateIsActiveTwoFa(email, true);
		console.log("update count:", updateCount)
		return updateCount
	}

	async disableTwoFa(email: string): Promise<any> {
		const updateCount = await this.userService.updateIsActiveTwoFa(email, false);
		return updateCount
	}
}