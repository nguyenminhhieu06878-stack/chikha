const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { db } = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); // Load env variables first

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
console.log('Checking Google OAuth config...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Configuring Google OAuth Strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google Strategy callback - Profile:', profile.id, profile.emails[0].value);
          
          // Check if user exists
          let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);

          if (user) {
            console.log('Found existing user by google_id:', user.id);
            return done(null, user);
          }

          // Check if email already exists
          user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.emails[0].value);

          if (user) {
            console.log('Found existing user by email, linking Google account:', user.id);
            // Link Google account to existing user
            db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(profile.id, user.id);
            user.google_id = profile.id;
            return done(null, user);
          }

          // Create new user
          console.log('Creating new user from Google profile');
          const userId = uuidv4();
          console.log('Generated UUID:', userId);
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
          
          db.prepare(`
            INSERT INTO users (id, email, password, full_name, google_id, role)
            VALUES (?, ?, ?, ?, ?, 'customer')
          `).run(
            userId,
            profile.emails[0].value,
            hashedPassword,
            profile.displayName,
            profile.id
          );

          user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
          console.log('New user created with id:', user ? user.id : 'NOT FOUND');
          
          done(null, user);
        } catch (error) {
          console.error('Google Strategy error:', error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️ Google OAuth not configured');
}

module.exports = passport;
