import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Res,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/42-auth.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { FortyTwoAuthGuard } from './guards/passport.guard';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';



const hostname = process.env.VITE_HOSTNAME || 'localhost';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
      throw new HttpException('User ID is invalid', HttpStatus.BAD_REQUEST);
    }
    return this.authService.getUserInfo(userId);
  }

  @Post('userInfoSomeoneElse')
  @UseGuards(JwtAuthGuard)
  async getUserInfoSomeoneElse(@Body() body: { requestedUser: string }) {
    const { requestedUser } = body;
    if (typeof requestedUser !== 'string') { //unnecesary?
      throw new HttpException('requestedUser is invalid', HttpStatus.BAD_REQUEST);
    }
    return this.authService.getUserInfoSomeoneElse(requestedUser);
  }

  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  async fortyTwoAuth() {
    console.log('aksjdfkajshdflkashfd')
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
      throw new HttpException(`Failed to upload avatar: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('set-display-name')
  @UseGuards(JwtAuthGuard)
  async setDisplayName(@Req() req, @Body() body: { displayName: string }) {
    const userId = req.user.userId;
    if (!userId) {
      throw new UnauthorizedException('User is not authenticated.');
    }
    const { displayName } = body;

    if (!displayName || displayName.trim().length === 0) {
      throw new HttpException("Display name can't be empty", HttpStatus.BAD_REQUEST);
    }
    else if (displayName.trim().length > 128) {
      throw new HttpException("display name can't be longer than 128 characters", HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await this.authService.updateDisplayName(userId, displayName);
    return { message: 'Display name updated successfully', user: updatedUser };
  }

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async callback(@Req() req, @Res() res) {
    const baseUrl = `http://${process.env.VITE_HOSTNAME}:${process.env.FRONTEND_PORT}`
    console.log("42/callback called with: ", req)
    try {
      console.log('Callback received:', req.user);
      const user = req.user;

      const savedUser = await this.authService.saveToDatabase(user);
      const { accessToken } = await this.authService.signIn(savedUser);
      console.log("accessToken", accessToken)

      if (savedUser.twoFASecretKey) {
        console.log("2fa is activated")
        const sessionId = uuidv4()
        await savedUser.update({ sessionId, accessToken })
        return res.redirect(`${baseUrl}/auth/verify-2fa?sessionId=${sessionId}`);
      }
      else {
        return res.redirect(`${baseUrl}/auth/42/callback?token=${accessToken}`);
      }

    } catch (error) {
      console.error('Callback error:', error);
      return res.redirect(`${baseUrl}/login?auth_error=authentication failed: ${error}`);
    }
  }

  //REMOVE THIS FUNCTION ITS FOR TESTING AND BYPASSES THE INTRA LOGIN
  @Get('testAccount')
  //   @UseGuards(FortyTwoAuthGuard)
  async callback_test(@Res() res) {
    try {
      console.log(process.env.VITE_CLIENT_UID_42);
      console.log('Callback bypassed for test account:');

      // Save the OAuth tokens and ensure the user is created in the database
      const savedUser = await this.authService.saveToDatabase({ email: "test.test", username: "testAccount", displayName: null, avatar: null, oauthToken: null, oauthRefreshToken: null, oauthExpiresAt: null, provider: '42' });

      // Generate the access token using the saved user's userId
      const { accessToken } = await this.authService.signIn(savedUser);

      const redirectUrl = `${process.env.FRONTEND_URL}/auth/42/callback?token=${accessToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Callback error:', error);
      return res.redirect(`http://${hostname}:${process.env.FRONTEND_PORT}/login?auth_error=${error}`);
    }
  }

  @Get('testAccount2')
  //   @UseGuards(FortyTwoAuthGuard)
  async callback_test2(@Res() res) {
    try {
      console.log(process.env.VITE_CLIENT_UID_42);
      console.log('Callback bypassed for test account :');

      // Save the OAuth tokens and ensure the user is created in the database
      const savedUser = await this.authService.saveToDatabase({ email: "test.test2", username: "testAccount2", displayName: null, avatar: null, oauthToken: null, oauthRefreshToken: null, oauthExpiresAt: null, provider: '42' });

      // Generate the access token using the saved user's userId
      const { accessToken } = await this.authService.signIn(savedUser);

      const redirectUrl = `http://${hostname}:${process.env.FRONTEND_PORT}/auth/42/callback?token=${accessToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Callback error:', error);
      return res.redirect(`http://${hostname}:${process.env.FRONTEND_PORT}/login?error=authentication_failed`);
    }
  }
}
