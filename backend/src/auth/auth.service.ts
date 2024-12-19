import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/auth.model'; // User model
import * as bcrypt from 'bcrypt'; // bcrypt for password hashing
import * as fs from 'fs'; // File system operations
import * as path from 'path'; // Path operations
import { v4 as uuidv4 } from 'uuid'; // UUID for generating unique file names

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getUserInfo(userId: number): Promise<Partial<User>> {
    const user = await User.findOne({
      where: { userId },
      attributes: ['userId', 'email', 'username', 'provider', 'oauthToken', 'oauthRefreshToken', 'avatar', 'displayName'], // Include displayName
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async createUser(email: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return User.create({ email, password: hashedPassword });
  }

  async signIn(user: User): Promise<{ accessToken: string; email: string }> {
    const payload = { userId: user.userId, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, email: user.email };
  }

  async saveToDatabase(user: any): Promise<User> {
    const { email, username, displayName = null, avatar = null, oauthToken = null, oauthRefreshToken = null, provider = '42' } = user;
  
    let existingUser = await User.findOne({ where: { email } });
  
    if (!existingUser) {
      existingUser = await User.create({ email, username, displayName, avatar, oauthToken, oauthRefreshToken, provider });
    } else {
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
  
    return existingUser;
  }

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

  async updateAvatar(userId: number, avatar: string): Promise<Partial<User>> {
    if (!avatar) {
      throw new Error('Avatar is required');
    }
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.avatar = avatar;
    await user.save();
    return { userId: user.userId, avatar: user.avatar };
  }

  // New method to handle the file upload
  async uploadAvatarFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('No file uploaded or file data is missing. Please upload a valid image file.');
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    const newFileName = `${uuidv4()}${fileExtension}`;
    const uploadPath = path.join(__dirname, '../../uploads/avatars', newFileName);

    // Ensure the directory exists
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save the file buffer to the disk
    try {
      await fs.promises.writeFile(uploadPath, file.buffer);
      return `uploads/avatars/${newFileName}`;
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  // Combines file upload with database update
  async updateUserAvatar(userId: number, file: Express.Multer.File): Promise<Partial<User>> {
    const avatarPath = await this.uploadAvatarFile(file);
    return this.updateAvatar(userId, avatarPath);
  }
}
