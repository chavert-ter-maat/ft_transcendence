// Controller.ts
// Purpose: Handles HTTP requests and defines routes.
// Typical Content: Controller methods are decorated with route decorators like @Get, @Post, etc., and often call methods in the service layer to handle business logic.
// Responsibilities:
// Receive and validate requests.
// Send responses.
// Delegate logic to the service layer.

import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Initiates OAuth login process, redirects to the 42 API authorization URL
  @Get('login')
  async login(@Req() req: Request, @Res() res: Response) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Missing environment variables');
  }
  
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
	res.redirect(authUrl);
  }

  // Callback route after OAuth authorization, handles the redirect and exchanges the code for user info
  @Get('42/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query; // OAuth authorization code

    // If the authorization code is missing, return an error
    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    try {
      // Validate the user using the code received from 42 API
      const user = await this.authService.validateOAuthUser(code as string);
      // Generate a JWT token for the authenticated user
      const jwt = await this.authService.login(user);

      // Redirect the user to your frontend or pass the JWT to your frontend
      res.redirect(`${process.env.FRONTEND_URL}/userpage?token=${jwt.access_token}`);
      // Alternatively, you can send a JSON response with the JWT if needed
      // res.json(jwt);
    } catch (error) {
      res.status(500).send('OAuth Authentication failed');
    }
  }
}
