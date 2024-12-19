import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/auth.model'; // Import the User model
import * as bcrypt from 'bcrypt'; // Import bcrypt to compare hashed passwords

type AuthInput = { email: string; password: string }; // Change username to email
type AuthResult = { accessToken: string; email: string }; // Change username to email

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getUserInfo(userId: number): Promise<Partial<User>> {
    const user = await User.findOne({
      where: { userId },
      attributes: ['userId', 'email', 'username', 'provider', 'oauthToken', 'oauthRefreshToken'], // Add all attributes you want
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async createUser(email: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ email, password: hashedPassword });
    return user;
  }

  async signIn(user: User): Promise<AuthResult> {
    if (!user.userId) {
      throw new Error('User ID is missing');
    }

    const payload = { userId: user.userId, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, email: user.email };
  }

  async saveToDatabase(user: any): Promise<User> {
    console.log('Saving OAuth tokens:', user);

    const {
      email,
      username,
      displayName = null,  // Include displayName
      oauthToken = null,
      oauthRefreshToken = null,
      oauthExpiresAt = null,
      provider = '42',
    } = user;

    if (!email) {
      throw new Error('Email is required to save OAuth tokens.');
    }

    let existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      existingUser = await User.create({
        email,
        username,
        displayName, // Add displayName when creating the user
        oauthToken,
        oauthRefreshToken,
        oauthExpiresAt,
        provider,
      });
    } else {
      existingUser.oauthToken = oauthToken;
      existingUser.oauthRefreshToken = oauthRefreshToken;
      existingUser.oauthExpiresAt = oauthExpiresAt;
      existingUser.provider = provider;

      // Set displayName if it's not already set
      if (displayName && !existingUser.displayName) {
        existingUser.displayName = displayName;
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
  
    // Only update if the displayName is provided and not already set
    user.displayName = displayName;
    await user.save();
  
    return { userId: user.userId, username: user.username, displayName: user.displayName }; // Return the updated user details
  }
}
