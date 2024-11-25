// users/users.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

interface LoginDto {
  username: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() loginDto: LoginDto): Promise<{ message: string }> {
    const { username, password } = loginDto;
    await this.usersService.register(username, password);
    return { message: 'User registered successfully!' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ message: string }> {
    const { username, password } = loginDto;
    await this.usersService.login(username, password);
    return { message: 'Login successful!' };
  }
}
