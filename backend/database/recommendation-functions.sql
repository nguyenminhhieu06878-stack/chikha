-- Function to find similar users based on purchase/activity patterns
CREATE OR REPLACE FUNCTION find_similar_users(
  target_user_id UUID,
  similarity_threshold DECIMAL DEFAULT 0.3,
  max_users INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id UUID,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH target_user_activities AS (
    SELECT product_id, activity_type
    FROM user_activities 
    WHERE user_id = target_user_id 
    AND activity_type IN ('purchase', 'add_to_cart', 'view')
  ),
  other_users_activities AS (
    SELECT 
      ua.user_id,
      ua.product_id,
      ua.activity_type,
      CASE 
        WHEN ua.activity_type = 'purchase' THEN 3
        WHEN ua.activity_type = 'add_to_cart' THEN 2
        ELSE 1
      END as weight
    FROM user_activities ua
    WHERE ua.user_id != target_user_id
    AND ua.activity_type IN ('purchase', 'add_to_cart', 'view')
  ),
  user_similarities AS (
    SELECT 
      oua.user_id,
      COUNT(*) as common_products,
      SUM(oua.weight) as weighted_score,
      COUNT(DISTINCT tua.product_id) as target_user_products
    FROM other_users_activities oua
    INNER JOIN target_user_activities tua ON oua.product_id = tua.product_id
    GROUP BY oua.user_id
  )
  SELECT 
    us.user_id,
    ROUND((us.weighted_score::DECIMAL / GREATEST(us.target_user_products, 1)), 4) as similarity_score
  FROM user_similarities us
  WHERE (us.weighted_score::DECIMAL / GREATEST(us.target_user_products, 1)) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT max_users;
END;
$$ LANGUAGE plpgsql;

-- Function to get products also bought together
CREATE OR REPLACE FUNCTION get_also_bought_products(
  target_product_id UUID,
  result_limit INTEGER DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  price DECIMAL,
  image_url VARCHAR,
  average_rating DECIMAL,
  total_reviews INTEGER,
  frequency_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH orders_with_target AS (
    SELECT DISTINCT oi.order_id
    FROM order_items oi
    WHERE oi.product_id = target_product_id
  ),
  also_bought_items AS (
    SELECT 
      oi.product_id,
      COUNT(*) as frequency
    FROM order_items oi
    INNER JOIN orders_with_target owt ON oi.order_id = owt.order_id
    WHERE oi.product_id != target_product_id
    GROUP BY oi.product_id
  )
  SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    p.average_rating,
    p.total_reviews,
    abi.frequency as frequency_score
  FROM also_bought_items abi
  INNER JOIN products p ON abi.product_id = p.id
  WHERE p.is_active = true
  ORDER BY abi.frequency DESC, p.average_rating DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate product similarity based on categories and attributes
CREATE OR REPLACE FUNCTION get_similar_products(
  target_product_id UUID,
  result_limit INTEGER DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  price DECIMAL,
  image_url VARCHAR,
  average_rating DECIMAL,
  total_reviews INTEGER,
  similarity_score DECIMAL
) AS $$
DECLARE
  target_product RECORD;
BEGIN
  -- Get target product details
  SELECT p.category_id, p.price, p.tags
  INTO target_product
  FROM products p
  WHERE p.id = target_product_id;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    p.average_rating,
    p.total_reviews,
    CASE 
      WHEN p.category_id = target_product.category_id THEN 1.0
      ELSE 0.5
    END +
    CASE 
      WHEN ABS(p.price - target_product.price) <= (target_product.price * 0.3) THEN 0.5
      ELSE 0.0
    END +
    CASE 
      WHEN p.tags && target_product.tags THEN 0.3
      ELSE 0.0
    END as similarity_score
  FROM products p
  WHERE p.id != target_product_id
  AND p.is_active = true
  ORDER BY similarity_score DESC, p.average_rating DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending products based on recent activity
CREATE OR REPLACE FUNCTION get_trending_products(
  days_back INTEGER DEFAULT 7,
  result_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  price DECIMAL,
  image_url VARCHAR,
  average_rating DECIMAL,
  total_reviews INTEGER,
  trend_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_activities AS (
    SELECT 
      ua.product_id,
      COUNT(*) as activity_count,
      SUM(CASE 
        WHEN ua.activity_type = 'purchase' THEN 5
        WHEN ua.activity_type = 'add_to_cart' THEN 3
        WHEN ua.activity_type = 'view' THEN 1
        ELSE 0
      END) as weighted_score
    FROM user_activities ua
    WHERE ua.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY ua.product_id
  ),
  product_trends AS (
    SELECT 
      ra.product_id,
      ra.weighted_score,
      p.popularity_score,
      (ra.weighted_score * 0.7 + COALESCE(p.popularity_score, 0) * 0.3) as trend_score
    FROM recent_activities ra
    INNER JOIN products p ON ra.product_id = p.id
    WHERE p.is_active = true
  )
  SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    p.average_rating,
    p.total_reviews,
    pt.trend_score
  FROM product_trends pt
  INNER JOIN products p ON pt.product_id = p.id
  ORDER BY pt.trend_score DESC, p.average_rating DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized recommendations for a user
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  target_user_id UUID,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  price DECIMAL,
  image_url VARCHAR,
  average_rating DECIMAL,
  total_reviews INTEGER,
  recommendation_score DECIMAL,
  recommendation_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      p.category_id,
      COUNT(*) as interaction_count,
      AVG(p.price) as avg_price_preference
    FROM user_activities ua
    INNER JOIN products p ON ua.product_id = p.id
    WHERE ua.user_id = target_user_id
    AND ua.activity_type IN ('purchase', 'add_to_cart', 'view')
    GROUP BY p.category_id
  ),
  user_viewed_products AS (
    SELECT DISTINCT product_id
    FROM user_activities
    WHERE user_id = target_user_id
  ),
  content_based_recs AS (
    SELECT 
      p.id,
      p.name,
      p.price,
      p.image_url,
      p.average_rating,
      p.total_reviews,
      (up.interaction_count::DECIMAL / 10.0 + 
       CASE WHEN ABS(p.price - up.avg_price_preference) <= (up.avg_price_preference * 0.5) THEN 0.5 ELSE 0.0 END +
       p.average_rating / 5.0) as recommendation_score,
      'content_based'::VARCHAR as recommendation_type
    FROM products p
    INNER JOIN user_preferences up ON p.category_id = up.category_id
    WHERE p.is_active = true
    AND p.id NOT IN (SELECT product_id FROM user_viewed_products)
  ),
  collaborative_recs AS (
    SELECT 
      p.id,
      p.name,
      p.price,
      p.image_url,
      p.average_rating,
      p.total_reviews,
      (COUNT(*) * 0.1 + p.average_rating / 5.0) as recommendation_score,
      'collaborative'::VARCHAR as recommendation_type
    FROM user_activities ua
    INNER JOIN find_similar_users(target_user_id, 0.2, 10) su ON ua.user_id = su.user_id
    INNER JOIN products p ON ua.product_id = p.id
    WHERE ua.activity_type IN ('purchase', 'add_to_cart')
    AND p.is_active = true
    AND p.id NOT IN (SELECT product_id FROM user_viewed_products)
    GROUP BY p.id, p.name, p.price, p.image_url, p.average_rating, p.total_reviews
  )
  SELECT * FROM (
    SELECT * FROM content_based_recs
    UNION ALL
    SELECT * FROM collaborative_recs
  ) combined_recs
  ORDER BY recommendation_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update product popularity scores
CREATE OR REPLACE FUNCTION update_all_product_popularity()
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET popularity_score = (
    SELECT COALESCE(
      (SELECT COUNT(*) FROM product_views 
       WHERE product_id = products.id 
       AND created_at > NOW() - INTERVAL '7 days') * 1.0 +
      (SELECT COUNT(*) FROM user_activities 
       WHERE product_id = products.id 
       AND activity_type = 'purchase'
       AND created_at > NOW() - INTERVAL '30 days') * 5.0 +
      (SELECT COUNT(*) FROM user_activities 
       WHERE product_id = products.id 
       AND activity_type = 'add_to_cart'
       AND created_at > NOW() - INTERVAL '7 days') * 2.0 +
      (SELECT AVG(rating) FROM reviews 
       WHERE product_id = products.id 
       AND is_approved = true) * 0.5,
      0
    )
  )
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_product ON user_activities(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_product_type ON user_activities(product_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Schedule popularity score updates (if using pg_cron)
-- SELECT cron.schedule('update-popularity', '0 */6 * * *', 'SELECT update_all_product_popularity();');