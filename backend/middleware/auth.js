const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { createClient } = require('@supabase/supabase-js');

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ 
        error: 'Invalid or expired token' 
      });
    }

    // Get user profile from users table first, then user_profiles (using service role to bypass RLS)
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // If not found in users table, check user_profiles
    if (!profile && !profileError) {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = userProfile;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'customer',
      ...profile
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication failed' 
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }
  next();
};

// Optional authentication (for guest users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        let { data: profile, error: profileError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // If not found in users table, check user_profiles
        if (!profile && !profileError) {
          const { data: userProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          profile = userProfile;
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: profile?.role || 'customer',
          ...profile
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for guest users
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};