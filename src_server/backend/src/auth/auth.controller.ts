import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/42-auth.guards';
import { FortyTwoAuthGuard } from './guards/passport.guard'; // Correct import for FortyTwoAuthGuard
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute(@Req() req) {
    return { message: 'Access granted', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('userInfo')
  async getUserInfo(@Req() req) {
    const userId = req.user.userId; 
    if (typeof userId !== 'number') {
      throw new Error('User ID is invalid');
    }
    return this.authService.getUserInfo(userId);
  }

  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoAuth() {
    return;
  }

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async callback(@Req() req, @Res() res) {
    try {
      console.log('Callback received:', req.user);
      const user = req.user;
  
      // Save the OAuth tokens and ensure the user is created in the database
      const savedUser = await this.authService.saveToDatabase(user);
      
      // Generate the access token using the saved user's userId
      const { accessToken } = await this.authService.signIn(savedUser);
  
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/42/callback?token=${accessToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
}
