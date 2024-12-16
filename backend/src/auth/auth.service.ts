import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/auth.model'; // Import the User model
// import { UsersService } from 'src/users/users.service'; // Assuming you're still using UsersService
import * as bcrypt from 'bcrypt'; // Import bcrypt to compare hashed passwords

type AuthInput = { username: string; password: string };
type AuthResult = { accessToken: string; username: string };

@Injectable()
export class AuthService {
  constructor(
    // private readonly userService: UsesService, // Make sure you still have this service if needed
    private readonly jwtService: JwtService,
  ) {}

  // async getMe(userId: number): Promise<Partial<User>> {
  //   const user = await User.findOne({
  //     where: { id: userId },
  //     attributes: ['id', 'username', 'email'], // Return only safe fields
  //   });

  
  //   if (!user) {
  //     throw new Error('User not found');
  //   }
  
  //   return user;
  // }
  
  async createUser(username: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, password: hashedPassword });
    return user;
  }

  async findUserByName(username: string): Promise<User | undefined> {
    return User.findOne({ where: { username } });
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.findUserByName(input.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.userId };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, username: user.username };
  }

  async signIn(user: User): Promise<AuthResult> {
    const payload = { sub: user.userId, username: user.username };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, username: user.username };
  }

  async saveOAuthTokens(user: any): Promise<void> {
    console.log('Saving OAuth tokens:', user); 

    const {
      username,
      oauthToken = null,
      oauthRefreshToken = null,
      oauthExpiresAt = null,
      provider = '42',
    } = user;

    if (!username) {
      throw new Error('Username is required to save OAuth tokens.');
    }

    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      existingUser.oauthToken = oauthToken;
      existingUser.oauthRefreshToken = oauthRefreshToken;
      existingUser.oauthExpiresAt = oauthExpiresAt;
      existingUser.provider = provider;
      await existingUser.save();
    } else {
      await User.create({
        username,
        oauthToken,
        oauthRefreshToken,
        oauthExpiresAt,
        provider,
      });
    }
  }
}
