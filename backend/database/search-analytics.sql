-- Bảng search analytics
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query VARCHAR(255) NOT NULL,
  search_count INTEGER DEFAULT 1,
  result_count INTEGER DEFAULT 0,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng user activity tracking (cho recommendation)
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'view', 'add_to_cart', 'purchase', 'review', 'search'
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional data like search query, rating, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng product views (để track popularity)
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng recommendation cache
CREATE TABLE IF NOT EXISTS recommendation_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL, -- 'similar', 'collaborative', 'trending', 'personalized'
  score DECIMAL(5,4) DEFAULT 0,
  metadata JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_count ON search_analytics(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_last_searched ON search_analytics(last_searched DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_product_id ON user_activities(product_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_type ON recommendation_cache(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires ON recommendation_cache(expires_at);

-- Function to clean old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Keep only last 90 days of user activities
  DELETE FROM user_activities 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Keep only last 30 days of product views
  DELETE FROM product_views 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean expired recommendation cache
  DELETE FROM recommendation_cache 
  WHERE expires_at < NOW();
  
  -- Keep only search analytics with more than 1 search or from last 30 days
  DELETE FROM search_analytics 
  WHERE search_count = 1 AND last_searched < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics();');

-- Trigger to update product popularity score
CREATE OR REPLACE FUNCTION update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product popularity based on recent views and purchases
  UPDATE products 
  SET popularity_score = (
    SELECT COALESCE(
      (SELECT COUNT(*) FROM product_views 
       WHERE product_id = NEW.product_id 
       AND created_at > NOW() - INTERVAL '7 days') * 1.0 +
      (SELECT COUNT(*) FROM user_activities 
       WHERE product_id = NEW.product_id 
       AND activity_type = 'purchase'
       AND created_at > NOW() - INTERVAL '30 days') * 5.0 +
      (SELECT COUNT(*) FROM user_activities 
       WHERE product_id = NEW.product_id 
       AND activity_type = 'add_to_cart'
       AND created_at > NOW() - INTERVAL '7 days') * 2.0,
      0
    )
  )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add popularity_score column to products if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'popularity_score') THEN
    ALTER TABLE products ADD COLUMN popularity_score DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_popularity_on_view ON product_views;
CREATE TRIGGER trigger_update_popularity_on_view
  AFTER INSERT ON product_views
  FOR EACH ROW
  EXECUTE FUNCTION update_product_popularity();

DROP TRIGGER IF EXISTS trigger_update_popularity_on_activity ON user_activities;
CREATE TRIGGER trigger_update_popularity_on_activity
  AFTER INSERT ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_product_popularity();