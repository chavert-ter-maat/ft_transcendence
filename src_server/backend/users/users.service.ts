import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {  }

  async register(username: string, password: string): Promise<void> {
    const existingUser = await this.userModel.findOne({ where: { username } });
    if (existingUser) throw new ConflictException('Username already taken');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // This will handle TypeScript error for missing properties in User
    await this.userModel.create({ username, password: hashedPassword, muted_users: [], blocked_users: [] } as any);
  }

  async login(username: string, password: string): Promise<void> {
    const user = await this.userModel.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
  }
}
