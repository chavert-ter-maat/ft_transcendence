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

@Controller('auth')
export class FortyTwoController {
  constructor(private authService: AuthService) { }

  @Get('42')
  @UseGuards(FortyTwoAuthGuard) 
  async redirectToFortyTwo() {
    // return 'Redirecting to 42 for authentication';
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
    const user = req.user; // OAuth user data returned by Passport
    console.log('Authenticated user:', user); 
  
    await this.authService.saveOAuthTokens(user);
  
    // Generate JWT and return it to the client
    try {
      const token = await this.authService.signIn(user);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/42/callback?token=${token}`);
    } catch (error) {
      console.error('Error during token generation:', error);
      return res.status(500).send('Internal Server Error');
    }
  }
}  
