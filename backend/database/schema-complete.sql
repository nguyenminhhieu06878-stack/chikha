-- ============================================
-- COMPLETE DATABASE SCHEMA FOR E-COMMERCE
-- SQLite Version
-- ============================================

-- ============================================
-- 1. COUPONS & DISCOUNTS
-- ============================================

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATETIME NOT NULL,
  valid_until DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================
-- 2. SEARCH ANALYTICS
-- ============================================

-- Search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_query VARCHAR(255),
  results_count INTEGER DEFAULT 0,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User activities for recommendations
CREATE TABLE IF NOT EXISTS user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================
-- 3. REVIEWS ADVANCED
-- ============================================

-- Add images column to reviews if not exists
-- Note: This will be handled by ALTER TABLE in migration

-- Review votes (helpful/not helpful)
CREATE TABLE IF NOT EXISTS review_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Review reports
CREATE TABLE IF NOT EXISTS review_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  reported_by INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_by INTEGER,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 4. INDEXES
-- ============================================

-- Coupon indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(search_query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_product ON user_activity(product_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);

-- ============================================
-- 5. SAMPLE DATA
-- ============================================

-- Insert sample coupons
INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until, is_active)
VALUES 
  ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10.00, 50.00, 20.00, 100, datetime('now'), datetime('now', '+30 days'), 1),
  ('SAVE20', 'Save $20 on orders over $100', 'fixed', 20.00, 100.00, NULL, 50, datetime('now'), datetime('now', '+14 days'), 1),
  ('FREESHIP', 'Free shipping', 'fixed', 10.00, 30.00, 10.00, 200, datetime('now'), datetime('now', '+60 days'), 1),
  ('MEGA50', 'Mega sale - 50% off', 'percentage', 50.00, 200.00, 100.00, 20, datetime('now'), datetime('now', '+7 days'), 1),
  ('NEWUSER', 'New user special - 15% off', 'percentage', 15.00, 0.00, 30.00, NULL, datetime('now'), datetime('now', '+90 days'), 1);

-- ============================================
-- 6. NOTES
-- ============================================

-- This schema includes:
-- 1. Coupon/Discount system with usage tracking
-- 2. Search analytics for tracking popular searches
-- 3. User activity tracking for AI recommendations
-- 4. Review voting system (helpful/not helpful)
-- 5. Review reporting system for moderation
-- 6. All necessary indexes for performance

-- To apply this schema:
-- sqlite3 backend/database/ecommerce.db < backend/database/schema-complete.sql

-- Or from Node.js:
-- const db = require('better-sqlite3')('backend/database/ecommerce.db');
-- const schema = fs.readFileSync('backend/database/schema-complete.sql', 'utf8');
-- db.exec(schema);
