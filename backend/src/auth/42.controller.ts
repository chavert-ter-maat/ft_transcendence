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

  // Route for 42 login redirection
  @Get('42')
  @UseGuards(FortyTwoAuthGuard) // Custom guard to handle OAuth flow
  async redirectToFortyTwo() {
    // return 'Redirecting to 42 for authentication';
  }

  // Route for username/password login
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
    console.log('Authenticated user:', user); // Log to check OAuth data

    // Save OAuth tokens and user data to the database
    await this.authService.saveOAuthTokens(user);

    // Generate JWT and return it to the client
    const token = await this.authService.signIn(user);

    // Use the frontend URL for redirection
    const frontendUrl = `${process.env.FRONTEND_URL}/userpage`;

    // Include the token as a query parameter
    return res.redirect(`${frontendUrl}?token=${token}`);
  }
}
