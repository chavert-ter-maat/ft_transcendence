import { 
  Controller, 
  Get, 
  Query, 
  Res, 
  HttpStatus, 
  HttpException,
  Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('42/callback')
  async oauthCallback(
    @Query('code') code: string, 
    @Query('state') state: string, 
    @Res() res: Response
  ) {
    try {
      // Complete authentication process
      const { user, jwtToken } = await this.authService.authenticateUser(code);
      
      // Redirect with JWT token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?token=${jwtToken}`);
    } catch (error) {
      this.logger.error('OAuth Callback Error', error);
      
      // Redirect to error page or login page
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    // Implement logout logic if needed
    res.clearCookie('jwt_token'); // Clear JWT cookie
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`);
  }
}