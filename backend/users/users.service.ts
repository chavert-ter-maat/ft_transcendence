// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  // Register a new user
  async register(username: string, password: string): Promise<void> {
    const existingUser = await this.userModel.findOne({ where: { username } });
    if (existingUser) throw new ConflictException('Username already taken');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    await this.userModel.create({ username, password: hashedPassword } as any);
  }

  // Login a user
  async login(username: string, password: string): Promise<void> {
    const user = await this.userModel.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
  }

  // Find or create a user using OAuth data
  async findOrCreateOAuthUser(profile: any): Promise<User> {
    const user = await this.userModel.findOne({ where: { username: profile.login } });
    if (user) {
      return user; // User already exists, return the user
    }

    // Create a new user using OAuth profile data
    return await this.userModel.create({ username: profile.login } as any);
  }
}
