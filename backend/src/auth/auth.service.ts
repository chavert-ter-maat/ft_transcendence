import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, user_stamp } from 'src/auth/auth.model';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

type AuthInput = { email: string; password: string };
type AuthResult = { accessToken: string; email: string };

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
	) { }

	arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
		const uint8Array = new Uint8Array(arrayBuffer);

		let binaryString = '';
		uint8Array.forEach(byte => {
			binaryString += String.fromCharCode(byte);
		});
		return btoa(binaryString);
	}

	async getUserInfo(userId: number): Promise<Partial<User>> {
		const user = await User.findOne({
			where: { userId },
			attributes: ['userId', 'email', 'username', 'provider', 'oauthToken', 'oauthRefreshToken', 'avatar', 'displayName', 'imageName', 'imageType', 'imageData'],
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		if (user.imageData)
			user.imageString = this.arrayBufferToBase64(user.imageData);
		return user;
	}

	async getUserInfoSomeoneElse(username: string): Promise<Partial<User>> {
		const user = await User.findOne({
			where: { username },
			attributes: ['username', 'provider', 'avatar', 'displayName', 'imageName', 'imageType', 'imageData'],
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		if (user.imageData)
			user.imageString = this.arrayBufferToBase64(user.imageData);
		return user;
	}


	async createUser(email: string, password: string): Promise<User> {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = await User.create({ email, password: hashedPassword, blocked_users: [], friends: [] });
		return user;
	}

	async signIn(user: User): Promise<AuthResult> {
		console.log("user", user)
		const payload = { userId: user.userId, email: user.email };
		const accessToken = this.jwtService.sign(payload);

		return { accessToken, email: user.email };
	}

	async saveToDatabase(user: any): Promise<User> {

		const {
			email,
			username,
			oauthToken = null,
			oauthRefreshToken = null,
			oauthExpiresAt = null,
			provider = '42'
		} = user; 
		const me_stamp: user_stamp = { name_: user.username, admin_: false, timestamp: Date() }

		if (!email) {  
			throw new HttpException('Email is required to save OAuth tokens.', HttpStatus.BAD_REQUEST);
		}

		let existingUser = await User.findOne({ where: { email } });

		if (!existingUser) {
			console.log("user not found, creating a new one")
			user = await User.create({
				...user, me_stamp
			});


			return user

		} else {
			console.log("user exists")
			existingUser.oauthToken = oauthToken;
			existingUser.oauthRefreshToken = oauthRefreshToken;
			await existingUser.save();
			return existingUser;
		}

	}

	async updateDisplayName(userId: number, displayName: string): Promise<Partial<User>> {
		if (!displayName) {
			throw new HttpException('Display name is required', HttpStatus.BAD_REQUEST);
		}
		const user = await User.findOne({ where: { userId } });
		const userWithSameUsername = await User.findOne({ where: { displayName } });

		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		else if (userWithSameUsername) {
			throw new UnauthorizedException('displayName must be unique');
		}

		user.displayName = displayName;
		await user.save();
		return { userId: user.userId, username: user.username, displayName: user.displayName };
	}

	async updateAvatar(userId: number, file: Express.Multer.File): Promise<Partial<User>> {
		if (!file || !file.buffer) {
			console.log("No file");
			throw new HttpException('No file uploaded or file data is missing.Please upload a valid image file.', HttpStatus.BAD_REQUEST);

		}

		const allowedExtensions = ['.png'];
		const fileExtension = path.extname(file.originalname).toLowerCase();

		if (!allowedExtensions.includes(fileExtension)) {
			throw new HttpException('Invalid file type. Only images are allowed.', HttpStatus.BAD_REQUEST);
		}
		const user = await User.findOne({ where: { userId } });
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		user.imageName = file.originalname;
		user.imageType = fileExtension;
		user.imageData = file.buffer;
		await user.save();
		return { userId: user.userId, avatar: user.avatar };
	}

	async updateUserAvatar(userId: number, file: Express.Multer.File): Promise<Partial<User>> {
		return this.updateAvatar(userId, file);
	}
}
