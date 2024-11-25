// Service.ts
// Purpose: Contains business logic and interacts with the data layer (e.g., database or external APIs).
// Typical Content: Implements methods that the controller calls. It’s where the actual "work" happens in your application.
// Responsibilities:
// Perform CRUD operations.
// Contain reusable logic.
// Abstract data access logic.

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOAuthUser(profile: any): Promise<any> {
    const user = await this.usersService.findOrCreateOAuthUser(profile);
    return user;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
