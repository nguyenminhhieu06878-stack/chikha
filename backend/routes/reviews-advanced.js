const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/reviews';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'));
    }
  }
});

// Get reviews for a product with advanced filtering
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      rating = '', 
      sort_by = 'newest',
      verified_only = 'false',
      with_images = 'false'
    } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select(`
        *,
        users (full_name, avatar_url),
        review_images (id, image_url, alt_text)
      `)
      .eq('product_id', productId)
      .eq('is_approved', true);

    // Filter by rating
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    // Filter verified purchases only
    if (verified_only === 'true') {
      query = query.eq('is_verified_purchase', true);
    }

    // Filter reviews with images only
    if (with_images === 'true') {
      // This would need a more complex query in production
      // For now, we'll filter after fetching
    }

    // Sort options
    switch (sort_by) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
    }

    const { data: reviews, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Filter reviews with images if requested
    let filteredReviews = reviews || [];
    if (with_images === 'true') {
      filteredReviews = filteredReviews.filter(review => 
        review.review_images && review.review_images.length > 0
      );
    }

    // Get rating distribution
    const { data: ratingStats } = await supabase
      .from('reviews')
      .select('rating, is_verified_purchase')
      .eq('product_id', productId)
      .eq('is_approved', true);

    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    const verifiedCount = ratingStats?.filter(r => r.is_verified_purchase).length || 0;
    const totalReviews = ratingStats?.length || 0;

    ratingStats?.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    const averageRating = totalReviews > 0 
      ? ratingStats.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    res.json({
      success: true,
      data: {
        reviews: filteredReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        },
        stats: {
          total_reviews: totalReviews,
          verified_reviews: verifiedCount,
          average_rating: Math.round(averageRating * 10) / 10,
          rating_distribution: ratingDistribution
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new review with images
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!product_id || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (comment && comment.length < 10) {
      return res.status(400).json({ error: 'Comment must be at least 10 characters long' });
    }

    // Check if user has purchased this product
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        *,
        orders!inner (user_id, status)
      `)
      .eq('product_id', product_id)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'completed');

    const hasPurchased = orderItems && orderItems.length > 0;

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: userId,
        rating: parseInt(rating),
        comment: comment || null,
        is_verified_purchase: hasPurchased,
        is_approved: true, // Auto-approve for now
        helpful_count: 0,
        not_helpful_count: 0
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
        const imageUrl = `/uploads/reviews/${file.filename}`;
        
        const { data: reviewImage, error: imageError } = await supabase
          .from('review_images')
          .insert({
            review_id: review.id,
            image_url: imageUrl,
            alt_text: `Review image for product ${product_id}`,
            file_size: file.size,
            mime_type: file.mimetype
          })
          .select()
          .single();

        if (!imageError) {
          imageUrls.push(reviewImage);
        }
      }
    }

    // Update product rating statistics
    await updateProductRating(product_id);

    // Log user activity
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        product_id,
        activity_type: 'review',
        metadata: { 
          rating, 
          has_images: imageUrls.length > 0,
          is_verified_purchase: hasPurchased
        }
      });

    res.status(201).json({
      success: true,
      data: {
        ...review,
        images: imageUrls
      }
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update review helpfulness
router.post('/:reviewId/helpful', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true or false
    const userId = req.user.id;

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // Update existing vote
      await supabase
        .from('review_votes')
        .update({ is_helpful: helpful })
        .eq('id', existingVote.id);
    } else {
      // Create new vote
      await supabase
        .from('review_votes')
        .insert({
          review_id: reviewId,
          user_id: userId,
          is_helpful: helpful
        });
    }

    // Update review helpful count
    const { data: votes } = await supabase
      .from('review_votes')
      .select('is_helpful')
      .eq('review_id', reviewId);

    const helpfulCount = votes?.filter(v => v.is_helpful).length || 0;
    const notHelpfulCount = votes?.filter(v => !v.is_helpful).length || 0;

    await supabase
      .from('reviews')
      .update({
        helpful_count: helpfulCount,
        not_helpful_count: notHelpfulCount
      })
      .eq('id', reviewId);

    res.json({ success: true, helpful_count: helpfulCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report inappropriate review
router.post('/:reviewId/report', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    // Check if user already reported this review
    const { data: existingReport } = await supabase
      .from('review_reports')
      .select('id')
      .eq('review_id', reviewId)
      .eq('reported_by', userId)
      .single();

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this review' });
    }

    // Create report
    const { data: report, error } = await supabase
      .from('review_reports')
      .insert({
        review_id: reviewId,
        reported_by: userId,
        reason,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Review reported successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all reviews for moderation
router.get('/admin/pending', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select(`
        *,
        users (full_name, email),
        products (name, image_url),
        review_images (id, image_url)
      `);

    if (status === 'pending') {
      query = query.eq('is_approved', false);
    } else if (status === 'reported') {
      // Get reviews that have been reported
      const { data: reportedReviews } = await supabase
        .from('review_reports')
        .select('review_id')
        .eq('status', 'pending');
      
      const reviewIds = reportedReviews?.map(r => r.review_id) || [];
      if (reviewIds.length > 0) {
        query = query.in('id', reviewIds);
      } else {
        return res.json({ success: true, data: { reviews: [], pagination: {} } });
      }
    }

    const { data: reviews, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        reviews: reviews || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve/reject review
router.put('/admin/:reviewId/moderate', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { reviewId } = req.params;
    const { action, reason } = req.body; // 'approve' or 'reject'

    const { data: review, error } = await supabase
      .from('reviews')
      .update({
        is_approved: action === 'approve',
        moderation_reason: reason || null,
        moderated_by: req.user.id,
        moderated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    // Update product rating if approved
    if (action === 'approve') {
      await updateProductRating(review.product_id);
    }

    // Update any pending reports for this review
    await supabase
      .from('review_reports')
      .update({ 
        status: action === 'approve' ? 'resolved_approved' : 'resolved_rejected',
        resolved_by: req.user.id,
        resolved_at: new Date().toISOString()
      })
      .eq('review_id', reviewId)
      .eq('status', 'pending');

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await supabase
        .from('products')
        .update({
          average_rating: Math.round(averageRating * 10) / 10,
          total_reviews: reviews.length
        })
        .eq('id', productId);
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

module.exports = router;