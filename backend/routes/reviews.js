const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const Joi = require('joi');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation schemas
const createReviewSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).required(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().min(10).max(1000),
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'ecommerce/reviews',
        public_id: `review_${Date.now()}_${originalname.split('.')[0]}`,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating_filter, sort_by = 'created_at' } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user_profiles!inner(full_name, avatar_url)
      `)
      .eq('product_id', productId)
      .range(offset, offset + limit - 1);
    
    // Apply rating filter
    if (rating_filter) {
      query = query.eq('rating', rating_filter);
    }
    
    // Apply sorting
    const sortOrder = sort_by === 'rating_desc' ? false : true;
    const sortField = sort_by.includes('rating') ? 'rating' : 'created_at';
    query = query.order(sortField, { ascending: sortOrder });
    
    const { data: reviews, error } = await query;
    
    if (error) throw error;
    
    // Get total count for pagination
    let countQuery = supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);
    
    if (rating_filter) {
      countQuery = countQuery.eq('rating', rating_filter);
    }
    
    const { count } = await countQuery;
    
    // Get rating summary
    const { data: ratingSummary } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    
    ratingSummary?.forEach(review => {
      ratingCounts[review.rating]++;
      totalRating += review.rating;
    });
    
    const averageRating = ratingSummary?.length > 0 ? totalRating / ratingSummary.length : 0;
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        },
        summary: {
          total_reviews: ratingSummary?.length || 0,
          average_rating: Math.round(averageRating * 10) / 10,
          rating_counts: ratingCounts
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

// POST /api/reviews - Create a new review
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { product_id, rating, comment } = value;
    const userId = req.user.id;
    
    // Check if user has purchased this product
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        *,
        orders!inner(user_id, status)
      `)
      .eq('product_id', product_id)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'delivered');
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You can only review products you have purchased'
      });
    }
    
    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', userId)
      .single();
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product'
      });
    }
    
    // Upload images to Cloudinary if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, file.originalname)
        );
        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          error: 'Failed to upload images'
        });
      }
    }
    
    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: userId,
        rating,
        comment,
        images: imageUrls,
        is_verified_purchase: true
      })
      .select(`
        *,
        user_profiles!inner(full_name, avatar_url)
      `)
      .single();
    
    if (reviewError) throw reviewError;
    
    // Update product average rating
    await updateProductRating(product_id);
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
});

// PUT /api/reviews/:id - Update a review
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validate request body
    const { error, value } = updateReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // Check if review exists and belongs to user
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or you do not have permission to edit it'
      });
    }
    
    // Handle image uploads
    let imageUrls = existingReview.images || [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, file.originalname)
        );
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls].slice(0, 5); // Max 5 images
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          error: 'Failed to upload images'
        });
      }
    }
    
    // Update review
    const updateData = { ...value, images: imageUrls };
    const { data: review, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user_profiles!inner(full_name, avatar_url)
      `)
      .single();
    
    if (updateError) throw updateError;
    
    // Update product average rating if rating changed
    if (value.rating && value.rating !== existingReview.rating) {
      await updateProductRating(existingReview.product_id);
    }
    
    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if review exists
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    // Check permission (owner or admin)
    if (existingReview.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this review'
      });
    }
    
    // Delete review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    // Update product average rating
    await updateProductRating(existingReview.product_id);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

// GET /api/reviews/user/:userId - Get reviews by user (admin only)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products!inner(name, images),
        user_profiles!inner(full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Get total count
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user reviews'
    });
  }
});

// Helper function to update product average rating
async function updateProductRating(productId) {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    
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
    } else {
      await supabase
        .from('products')
        .update({
          average_rating: 0,
          total_reviews: 0
        })
        .eq('id', productId);
    }
  } catch (error) {
    console.error('Update product rating error:', error);
  }
}

module.exports = router;