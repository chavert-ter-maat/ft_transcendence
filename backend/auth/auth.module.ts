// Module.ts
// Purpose: Defines the scope of the module and ties together controllers, services, and other providers.
// Typical Content: The @Module decorator declares the imports, controllers, providers, and exports for the module.
// Responsibilities:
// Organize application features into modules.
// Provide dependency injection for services.

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { OAuth42Strategy } from './oauth42.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'oauth42' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule,
  ],
  providers: [AuthService, OAuth42Strategy],
  controllers: [AuthController],
})
export class AuthModule {}
