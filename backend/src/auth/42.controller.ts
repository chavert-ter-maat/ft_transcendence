// src/auth/42.controller.ts

import { FortyTwoAuthGuard } from './guards/passport.guard'; // Correct import for FortyTwoAuthGuard
import { AuthService } from './auth.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

@Controller('auth')  // Remove 'api' prefix since it's now global
export class FortyTwoController {
  constructor(private authService: AuthService) { }

  @Get('42')
  @UseGuards(FortyTwoAuthGuard) 
  async fortyTwoAuth() {
    // The guard will handle the redirect
    return;
  }

  @Post('login')
  async usernamePasswordLogin(
    @Body() body: { username: string; password: string },
  ) {
    return this.authService.authenticate(body);
  }

  // Callback route after successful OAuth authentication
  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async callback(@Req() req, @Res() res) {
    try {
      console.log('Callback received:', req.user);
      const user = req.user;
      
      await this.authService.saveOAuthTokens(user);
      const { accessToken } = await this.authService.signIn(user);
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/42/callback?token=${accessToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
}
