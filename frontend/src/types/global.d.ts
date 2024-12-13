// // src/global.d.ts

// // Extend the Window object (for example, if you need to access global variables)
// interface Window {
// 	myCustomGlobalVariable: any;
//   }
  
//   // Add types for API responses or common entities
//   interface User {
// 	id: number;
// 	username: string;
// 	email: string;
// 	// Add any other fields relevant to your user model
//   }
  
//   interface AuthResponse {
// 	token: string;
// 	user: User;
//   }
  
//   // Add types for environment variables if needed
//   declare namespace NodeJS {
// 	interface ProcessEnv {
// 	  REACT_APP_API_URL: string;
// 	  NODE_ENV: 'development' | 'production' | 'test';
// 	  CLIENT_ID: string;
// 	  CLIENT_SECRET: string;
// 	  REDIRECT_URI: string;
// 	}
//   }
  
//   // Extend Passport types
//   declare module 'passport' {
// 	interface Profile {
// 	  id: string;
// 	  displayName: string;
// 	  emails: Array<{ value: string }>;
// 	  // Add any other profile properties that you need
// 	}
//   }
  
//   // Define types for the OAuth2 strategy callback
//   declare module 'passport-oauth2' {
// 	import { Profile, VerifyCallback } from 'passport';
  
// 	// The OAuth2 callback function signature
// 	type OAuth2VerifyCallback = (
// 	  accessToken: string,
// 	  refreshToken: string,
// 	  profile: Profile,
// 	  done: VerifyCallback
// 	) => void;
//   }
  