// src/auth/strategies/42.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../auth.model';
import Strategy from 'passport-42';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID: process.env['42_CLIENT_ID'],
      clientSecret: process.env['42_CLIENT_SECRET'],
      callbackURL: process.env['42_CALLBACK_URL'],
      scope: ['public'],
    });
  }

  	// What does this do? and where is it used? ah builtin shit from PassportStrategy, but shouldn't there be comparisons
	// With some help from the little internet helper the problem is overhere, i guess.
	// It has to be validated against something. 
  async validate(accessToken: string, refreshToken: string, profile: any) {
	console.log("VALIDATING!:" + profile);
    const user = {
      id: profile.id,
      username: profile.username,
      email: profile.emails[0].value,
      oauthToken: accessToken,
      oauthRefreshToken: refreshToken,
      provider: '42'
    };

	// something like this i think might break 
	let this_user = await User.findOne({where: {id: user.id}})
	if (this_user)
	{
		console.log("FOUND");
		return this_user;
	}
	return (user);
  }
}
