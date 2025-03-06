import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/auth.model'; // Import the User model
import * as bcrypt from 'bcrypt'; // Import bcrypt to compare hashed passwords
import * as path from 'path'; // Path operations

type AuthInput = { email: string; password: string };  // Change username to email
type AuthResult = { accessToken: string; email: string };  // Change username to email

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

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
      attributes: ['userId', 'email', 'username', 'provider', 'oauthToken', 'oauthRefreshToken', 'avatar', 'displayName', 'imageName', 'imageType', 'imageData'],  // Add all attributes you want
    });
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
	if (user.imageData)
		user.imageString = this.arrayBufferToBase64(user.imageData); //shitty placed
    return user;
  }

  async getUserInfoSomeoneElse(username: string): Promise<Partial<User>> {
    const user = await User.findOne({
      where: { username },
      attributes: ['username', 'provider', 'avatar', 'displayName', 'imageName', 'imageType', 'imageData'],  // Add all attributes you want
    });
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
	if (user.imageData)
		user.imageString = this.arrayBufferToBase64(user.imageData); //shitty placed
    return user;
  }
  

  async createUser(email: string, password: string): Promise<User> {  // Change username to email
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ email, password: hashedPassword, blocked_users: [] });  // Change username to email
    return user;
  }

  async signIn(user: User): Promise<AuthResult> {
    const payload = { userId: user.userId, email: user.email };  // Change username to email
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, email: user.email };  // Change username to email
  }

  async saveToDatabase(user: any): Promise<User> {
    console.log('Saving OAuth tokens:', user); 
  
    const { email, username, displayName = null, avatar = null, oauthToken = null, oauthRefreshToken = null, oauthExpiresAt = null, provider = '42' } = user;  // Change username to email
  
    if (!email) {  // Change username to email
      throw new Error('Email is required to save OAuth tokens.');
    }
  
    let existingUser = await User.findOne({ where: { email } });  // Check for email

    if (!existingUser) {
      // Create the user if it doesn't exist
      existingUser = await User.create({
        email, 
        username,  // Save username as well
		displayName,
		avatar,
        oauthToken,
        oauthRefreshToken,
        oauthExpiresAt,
        provider,
		blocked_users: [],
      });
    } else {
      // Update the user if already exists
		existingUser.oauthToken = oauthToken;
		existingUser.oauthRefreshToken = oauthRefreshToken;
		if (displayName && !existingUser.displayName) {
			existingUser.displayName = displayName;
		}
		if (avatar && !existingUser.avatar) {
			existingUser.avatar = avatar;
		}
		await existingUser.save();
    }
  
    return existingUser;  // Return the user with the userId
  }
// }

	async updateDisplayName(userId: number, displayName: string): Promise<Partial<User>> {
		if (!displayName) {
		throw new Error('Display name is required');
		}
		const user = await User.findOne({ where: { userId } });
		if (!user) {
		throw new UnauthorizedException('User not found');
		}
		user.displayName = displayName;
		await user.save();
		return { userId: user.userId, username: user.username, displayName: user.displayName };
	}

	async updateAvatar(userId: number, file: Express.Multer.File): Promise<Partial<User>> {
		if (!file || !file.buffer) {
			console.log("No file");
		throw new Error('No file uploaded or file data is missing. Please upload a valid image file.');
		}

		const allowedExtensions = ['.png'];
		const fileExtension = path.extname(file.originalname).toLowerCase();

		if (!allowedExtensions.includes(fileExtension)) {
		throw new Error('Invalid file type. Only images are allowed.');
		}
		const user = await User.findOne({ where: { userId } });
		if (!user) {
		throw new UnauthorizedException('User not found');
		}
		user.imageName =  file.originalname;
		user.imageType = fileExtension;
		user.imageData = file.buffer;
		await user.save();
		return { userId: user.userId, avatar: user.avatar };
	}

	// Combines file upload with database update
	async updateUserAvatar(userId: number, file: Express.Multer.File): Promise<Partial<User>> {
		return this.updateAvatar(userId, file);
	}
}
