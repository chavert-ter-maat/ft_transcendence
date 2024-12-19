import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/auth.model'; // Import the User model
import * as bcrypt from 'bcrypt'; // Import bcrypt to compare hashed passwords

type AuthInput = { email: string; password: string };  // Change username to email
type AuthResult = { accessToken: string; email: string };  // Change username to email

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async getUserInfo(userId: number): Promise<Partial<User>> {
    const user = await User.findOne({
      where: { userId },
      attributes: ['userId', 'email', 'username', 'provider', 'oauthToken', 'oauthRefreshToken'],  // Add all attributes you want
    });
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  
    return user;
  }
  

  async createUser(email: string, password: string): Promise<User> {  // Change username to email
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ email, password: hashedPassword });  // Change username to email
    return user;
  }

  async signIn(user: User): Promise<AuthResult> {
    if (!user.userId) {
      throw new Error('User ID is missing');
    }

    const payload = { userId: user.userId, email: user.email };  // Change username to email
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, email: user.email };  // Change username to email
  }

  async saveToDatabase(user: any): Promise<User> {
    console.log('Saving OAuth tokens:', user); 
  
    const { email, username, oauthToken = null, oauthRefreshToken = null, oauthExpiresAt = null, provider = '42' } = user;  // Change username to email
  
    if (!email) {  // Change username to email
      throw new Error('Email is required to save OAuth tokens.');
    }
  
    let existingUser = await User.findOne({ where: { email } });  // Check for email

    if (!existingUser) {
      // Create the user if it doesn't exist
      existingUser = await User.create({
        email, 
        username,  // Save username as well
        oauthToken,
        oauthRefreshToken,
        oauthExpiresAt,
        provider,
      });
    } else {
      // Update the user if already exists
      existingUser.oauthToken = oauthToken;
      existingUser.oauthRefreshToken = oauthRefreshToken;
      existingUser.oauthExpiresAt = oauthExpiresAt;
      existingUser.provider = provider;
      await existingUser.save();
    }
  
    return existingUser;  // Return the user with the userId
  }
}
