// src/auth/guards/passport.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {} //
