import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
  Res,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/42-auth.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { FortyTwoAuthGuard } from './guards/passport.guard'; // Correct import for FortyTwoAuthGuard
import { AuthService } from './auth.service';
import { User } from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute(@Req() req) {
    return { message: 'Access granted', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('userInfo') //might be security issue? req.user.id can be arbitrarly set or is this protected?
  async getUserInfo(@Req() req) {
    const userId = req.user.userId; 
    if (typeof userId !== 'number') {
      throw new Error('User ID is invalid');
    }
    return this.authService.getUserInfo(userId);
  }

  @Post('userInfoSomeoneElse')
  @UseGuards(JwtAuthGuard)
  async getUserInfoSomeoneElse(@Body() body: { requestedUser: string }) {
	const { requestedUser } = body;
    if (typeof requestedUser !== 'string') { //unnecesary?
      throw new Error('requestedUser is invalid');
    }
    return this.authService.getUserInfoSomeoneElse(requestedUser);
  }

  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoAuth() {
    return;
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file, @Req() req): Promise<any> {
    try {
      const userId = req.user.userId;
      
      // Handle the avatar upload and get the avatar URL
      const updatedUser = await this.authService.updateUserAvatar(userId, file);

      // Return the avatar URL in the response
      return { avatar: updatedUser.avatar }; // Returning the avatar URL to be used on the front-end
    } catch (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  @Post('set-display-name')
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

  //REMOVE THIS FUNCTION ITS FOR TESTING AND BYPASSES THE INTRA LOGIN
  @Get('testAccount') 
//   @UseGuards(FortyTwoAuthGuard)
  async callback_test(@Res() res) {
    try {
      console.log('Callback bypassed for test account :');
  
      // Save the OAuth tokens and ensure the user is created in the database
      const savedUser = await this.authService.saveToDatabase({ email: "test.test", username: "testAccount", displayName: null, avatar: null, oauthToken: null, oauthRefreshToken: null, oauthExpiresAt: null, provider: '42' });
      
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
