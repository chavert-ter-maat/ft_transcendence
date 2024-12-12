// src/auth/auth.service.ts

import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  NotImplementedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guards/passport.guard';

@Controller('auth-v2')
export class PassportAuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(FortyTwoAuthGuard)
  login() {
    return 'success';
  }

  @Get('me')
  getUserInfo() {
    throw new NotImplementedException();
  }
}
