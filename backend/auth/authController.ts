import express from 'express';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

const router = express.Router();

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.REDIRECT_URI || '',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: Error | null, user?: Express.User) => void // Type for `done`
    ) => {
      console.log('Access Token:', accessToken);
      console.log('User Profile:', profile);
      done(null, profile); // Save profile for the session (optional)
    }
  )
);

// Initialize session handling (optional)
passport.serializeUser((user: Express.User, done: (err: Error | null, id?: unknown) => void) => done(null, user));
passport.deserializeUser((user: Express.User, done: (err: Error | null, user?: Express.User) => void) => done(null, user));

// Authentication route
router.get('/auth/42', passport.authenticate('oauth2'));

// OAuth2 callback handler
router.get('/auth/42/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful login, redirect to the user profile page
    res.redirect('/user');
  }
);

export default router;
