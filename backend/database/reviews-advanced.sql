-- Bảng review images
CREATE TABLE IF NOT EXISTS review_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng review votes (helpful/not helpful)
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Bảng review reports
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL, -- 'spam', 'inappropriate', 'fake', 'offensive'
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved_approved', 'resolved_rejected'
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm các cột mới vào bảng reviews
DO $$ 
BEGIN
  -- Add helpful counts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'helpful_count') THEN
    ALTER TABLE reviews ADD COLUMN helpful_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'not_helpful_count') THEN
    ALTER TABLE reviews ADD COLUMN not_helpful_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add verification status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_verified_purchase') THEN
    ALTER TABLE reviews ADD COLUMN is_verified_purchase BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add moderation fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_approved') THEN
    ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'moderation_reason') THEN
    ALTER TABLE reviews ADD COLUMN moderation_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'moderated_by') THEN
    ALTER TABLE reviews ADD COLUMN moderated_by UUID REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'moderated_at') THEN
    ALTER TABLE reviews ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified_purchase);

-- Function to update helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews 
  SET 
    helpful_count = (
      SELECT COUNT(*) FROM review_votes 
      WHERE review_id = NEW.review_id AND is_helpful = TRUE
    ),
    not_helpful_count = (
      SELECT COUNT(*) FROM review_votes 
      WHERE review_id = NEW.review_id AND is_helpful = FALSE
    )
  WHERE id = NEW.review_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful counts
DROP TRIGGER IF EXISTS trigger_update_helpful_counts ON review_votes;
CREATE TRIGGER trigger_update_helpful_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_counts();

-- Function to check verified purchase
CREATE OR REPLACE FUNCTION check_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has purchased this product
  NEW.is_verified_purchase := EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.user_id = NEW.user_id 
    AND oi.product_id = NEW.product_id
    AND o.status = 'completed'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verified purchase check
DROP TRIGGER IF EXISTS trigger_check_verified_purchase ON reviews;
CREATE TRIGGER trigger_check_verified_purchase
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION check_verified_purchase();

-- Sample data for testing
INSERT INTO review_reports (review_id, reported_by, reason, description) VALUES
(
  (SELECT id FROM reviews LIMIT 1),
  (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
  'spam',
  'This review appears to be spam content'
) ON CONFLICT DO NOTHING;