// src/types/passport-oauth2.d.ts
declare module 'passport-oauth2' {
	import { Strategy as PassportStrategy } from 'passport';
  
	// Define the profile type
	interface Profile {
	  id: string;
	  username?: string;
	  displayName?: string;
	  emails?: Array<{ value: string }>;
	  photos?: Array<{ value: string }>;
	  // Add other fields as needed based on the OAuth2 provider
	}
  
	export class Strategy extends PassportStrategy {
	  constructor(
		options: {
		  authorizationURL: string;
		  tokenURL: string;
		  clientID: string;
		  clientSecret: string;
		  callbackURL: string;
		},
		verify: (
		  accessToken: string,
		  refreshToken: string,
		  profile: Profile,
		  done: (error: Error | null, user?: any) => void
		) => void
	  );
	}
  }
  