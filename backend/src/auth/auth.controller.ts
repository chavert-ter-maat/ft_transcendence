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

  @Post('login')
  async usernamePasswordLogin(
    @Body() body: { username: string; password: string },
  ) {
    return this.authService.authenticate(body);
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard) // Apply the JwtAuthGuard here
  protectedRoute(@Req() req) {
    return { message: 'Access granted', user: req.user };
  }

  @Post('create')
  async createUser(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    return this.authService.createUser(username, password);
  }

  @Get(':username')
  async findUser(@Param('username') username: string) {
    return this.authService.findUserByName(username);
  }

  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoAuth() {
    // The guard will handle the redirect
    return;
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
