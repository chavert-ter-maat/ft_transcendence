import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
  Res,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/42-auth.guards';
import { FortyTwoAuthGuard } from './guards/passport.guard'; // Correct import for FortyTwoAuthGuard
import { AuthService } from './auth.service';
import { User } from './auth.model'; // Import your User model or entity

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

  @Put('set-display-name')
  @UseGuards(JwtAuthGuard)
  async setDisplayName(@Req() req, @Body() body: { displayName: string }) {
    const userId = req.user.userId; // Extract userId from JWT payload
    if (!userId) {
      throw new UnauthorizedException('User is not authenticated.');
    }
    const { displayName } = body;
  
    // Check if the display name is valid
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name is required');
    }
  
    const updatedUser = await this.authService.updateDisplayName(userId, displayName);
    return { message: 'Display name updated successfully', user: updatedUser };
  }

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async callback(@Req() req, @Res() res) {
    try {
      console.log('Callback received:', req.user);
      const user = req.user;

      const savedUser = await this.authService.saveToDatabase(user);
      const { accessToken } = await this.authService.signIn(savedUser);

      const redirectUrl = `${process.env.FRONTEND_URL}/auth/42/callback?token=${accessToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
}
