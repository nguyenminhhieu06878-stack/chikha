const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');
const bcrypt = require('bcryptjs');

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
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);

          if (user) {
            return done(null, user);
          }

          // Check if email already exists
          user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.emails[0].value);

          if (user) {
            // Link Google account to existing user
            db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(profile.id, user.id);
            user.google_id = profile.id;
            return done(null, user);
          }

          // Create new user
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
          
          const result = db.prepare(`
            INSERT INTO users (email, password, full_name, google_id, role)
            VALUES (?, ?, ?, ?, 'customer')
          `).run(
            profile.emails[0].value,
            hashedPassword,
            profile.displayName,
            profile.id
          );

          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
          
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️ Google OAuth not configured');
}

module.exports = passport;
