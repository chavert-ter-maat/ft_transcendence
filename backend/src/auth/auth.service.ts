import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  // Exchange the authorization code for an access token
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const response = await axios.post<TokenResponse>('https://api.intra.42.fr/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.FORTYTWO_CLIENT_ID,
          client_secret: process.env.FORTYTWO_CLIENT_SECRET,
          redirect_uri: process.env.FORTYTWO_REDIRECT_URI,
          code: code,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new UnauthorizedException('Failed to exchange code for token');
    }
  }

  // Get user info from the 42 API using the access token
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await axios.get<UserInfo>('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('User info fetch error:', error);
      throw new UnauthorizedException('Failed to fetch user info');
    }
  }

  // Complete OAuth authentication process
  async authenticateUser(code: string) {
    try {
      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(code);

      // Get user information
      const userInfo = await this.getUserInfo(tokenData.access_token);

      // Prepare user data for creation/update
      const userData = {
        username: userInfo.username,
        email: userInfo.email,
        avatarurl: userInfo.avatar_url,
        oauthprovider: '42',
        oauthid: userInfo.id.toString()
      };

      // Create or update user
      const user = await this.userService.createUser(userData);

      // Save OAuth token
      await this.userService.saveUserToken({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        userId: user.id
      });

      // Generate JWT token
      const jwtToken = this.generateJwtToken(user);

      return {
        user,
        jwtToken
      };
    } catch (error) {
      console.error('Authentication process error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  // Generate JWT token for the user
  private generateJwtToken(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username 
    };
    return this.jwtService.sign(payload);
  }
}