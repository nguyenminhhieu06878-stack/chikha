const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// GET /api/recommendations/similar/:productId - Get similar products
router.get('/similar/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;
    
    // Get the current product details
    const { data: currentProduct, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, category_id, price, average_rating')
      .eq('id', productId)
      .single();
    
    if (productError || !currentProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Find similar products based on category and price range
    const priceRange = currentProduct.price * 0.3; // 30% price range
    const minPrice = currentProduct.price - priceRange;
    const maxPrice = currentProduct.price + priceRange;
    
    const { data: similarProducts, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        price,
        discount_price,
        images,
        average_rating,
        total_reviews,
        categories(name)
      `)
      .eq('category_id', currentProduct.category_id)
      .neq('id', productId)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .gt('stock_quantity', 0)
      .order('average_rating', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    // If not enough similar products, get more from the same category
    if (similarProducts.length < limit) {
      const remainingLimit = limit - similarProducts.length;
      const existingIds = similarProducts.map(p => p.id);
      
      const { data: additionalProducts } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          name,
          price,
          discount_price,
          images,
          average_rating,
          total_reviews,
          categories(name)
        `)
        .eq('category_id', currentProduct.category_id)
        .neq('id', productId)
        .not('id', 'in', `(${existingIds.join(',')})`)
        .gt('stock_quantity', 0)
        .order('total_reviews', { ascending: false })
        .limit(remainingLimit);
      
      if (additionalProducts) {
        similarProducts.push(...additionalProducts);
      }
    }
    
    res.json({
      success: true,
      data: similarProducts,
      metadata: {
        based_on: 'category_and_price',
        current_product: currentProduct.name
      }
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch similar products'
    });
  }
});

// GET /api/recommendations/for-user - Get personalized recommendations
router.get('/for-user', optionalAuth, async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const userId = req.user?.id;
    
    if (!userId) {
      // Return trending products for non-authenticated users
      return getTrendingProducts(res, limit);
    }
    
    // Get user's purchase and view history
    const { data: userActivity, error: activityError } = await supabase
      .from('user_activity')
      .select(`
        product_id,
        action_type,
        products!inner(category_id, price)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (activityError) throw activityError;
    
    if (!userActivity || userActivity.length === 0) {
      return getTrendingProducts(res, limit);
    }
    
    // Analyze user preferences
    const categoryPreferences = {};
    const priceRanges = [];
    const viewedProducts = new Set();
    
    userActivity.forEach(activity => {
      const categoryId = activity.products.category_id;
      const price = activity.products.price;
      
      // Count category preferences with weights
      const weight = activity.action_type === 'purchase' ? 3 : 
                    activity.action_type === 'add_to_cart' ? 2 : 1;
      
      categoryPreferences[categoryId] = (categoryPreferences[categoryId] || 0) + weight;
      priceRanges.push(price);
      viewedProducts.add(activity.product_id);
    });
    
    // Calculate preferred price range
    const avgPrice = priceRanges.reduce((sum, price) => sum + price, 0) / priceRanges.length;
    const priceRange = avgPrice * 0.5; // 50% range
    
    // Get top preferred categories
    const topCategories = Object.entries(categoryPreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoryId]) => categoryId);
    
    // Find recommended products
    let recommendedProducts = [];
    
    for (const categoryId of topCategories) {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          discount_price,
          images,
          average_rating,
          total_reviews,
          categories(name)
        `)
        .eq('category_id', categoryId)
        .not('id', 'in', `(${Array.from(viewedProducts).join(',')})`)
        .gte('price', avgPrice - priceRange)
        .lte('price', avgPrice + priceRange)
        .gt('stock_quantity', 0)
        .order('average_rating', { ascending: false })
        .limit(Math.ceil(limit / topCategories.length));
      
      if (products) {
        recommendedProducts.push(...products);
      }
    }
    
    // Remove duplicates and limit results
    const uniqueProducts = recommendedProducts
      .filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      .slice(0, limit);
    
    // If not enough personalized recommendations, fill with trending products
    if (uniqueProducts.length < limit) {
      const remainingLimit = limit - uniqueProducts.length;
      const existingIds = uniqueProducts.map(p => p.id);
      const allViewedIds = Array.from(viewedProducts);
      
      const { data: trendingProducts } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          discount_price,
          images,
          average_rating,
          total_reviews,
          categories(name)
        `)
        .not('id', 'in', `(${[...existingIds, ...allViewedIds].join(',')})`)
        .gt('stock_quantity', 0)
        .order('total_reviews', { ascending: false })
        .limit(remainingLimit);
      
      if (trendingProducts) {
        uniqueProducts.push(...trendingProducts);
      }
    }
    
    res.json({
      success: true,
      data: uniqueProducts,
      metadata: {
        based_on: 'user_behavior',
        user_preferences: {
          top_categories: topCategories,
          avg_price_range: `$${(avgPrice - priceRange).toFixed(2)} - $${(avgPrice + priceRange).toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized recommendations'
    });
  }
});

// GET /api/recommendations/trending - Get trending products
router.get('/trending', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    return getTrendingProducts(res, limit);
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending products'
    });
  }
});

// GET /api/recommendations/customers-also-bought/:productId - Collaborative filtering
router.get('/customers-also-bought/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;
    
    // Find users who bought this product
    const { data: buyers, error: buyersError } = await supabase
      .from('order_items')
      .select(`
        orders!inner(user_id, status)
      `)
      .eq('product_id', productId)
      .eq('orders.status', 'delivered');
    
    if (buyersError) throw buyersError;
    
    if (!buyers || buyers.length === 0) {
      return res.json({
        success: true,
        data: [],
        metadata: {
          based_on: 'collaborative_filtering',
          message: 'No purchase data available'
        }
      });
    }
    
    const buyerIds = buyers.map(buyer => buyer.orders.user_id);
    
    // Find other products these users bought
    const { data: otherPurchases, error: purchasesError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        products!inner(
          id,
          name,
          price,
          discount_price,
          images,
          average_rating,
          total_reviews,
          categories(name)
        ),
        orders!inner(user_id, status)
      `)
      .in('orders.user_id', buyerIds)
      .neq('product_id', productId)
      .eq('orders.status', 'delivered')
      .gt('products.stock_quantity', 0);
    
    if (purchasesError) throw purchasesError;
    
    // Count frequency of each product
    const productCounts = {};
    otherPurchases.forEach(purchase => {
      const productId = purchase.product_id;
      productCounts[productId] = (productCounts[productId] || 0) + 1;
    });
    
    // Sort by frequency and get top products
    const sortedProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => {
        return otherPurchases.find(p => p.product_id === productId).products;
      });
    
    // Remove duplicates
    const uniqueProducts = sortedProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    res.json({
      success: true,
      data: uniqueProducts,
      metadata: {
        based_on: 'collaborative_filtering',
        total_buyers: buyerIds.length
      }
    });
  } catch (error) {
    console.error('Get customers also bought error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers also bought products'
    });
  }
});

// GET /api/recommendations/recently-viewed - Get recently viewed products
router.get('/recently-viewed', optionalAuth, async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({
        success: true,
        data: [],
        metadata: {
          message: 'Authentication required for recently viewed products'
        }
      });
    }
    
    const { data: recentlyViewed, error } = await supabase
      .from('user_activity')
      .select(`
        product_id,
        created_at,
        products!inner(
          id,
          name,
          price,
          discount_price,
          images,
          average_rating,
          total_reviews,
          stock_quantity,
          categories(name)
        )
      `)
      .eq('user_id', userId)
      .eq('action_type', 'view')
      .gt('products.stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    // Remove duplicates (keep most recent)
    const uniqueProducts = [];
    const seenIds = new Set();
    
    recentlyViewed.forEach(item => {
      if (!seenIds.has(item.product_id)) {
        seenIds.add(item.product_id);
        uniqueProducts.push(item.products);
      }
    });
    
    res.json({
      success: true,
      data: uniqueProducts,
      metadata: {
        based_on: 'recently_viewed'
      }
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recently viewed products'
    });
  }
});

// Helper function to get trending products
async function getTrendingProducts(res, limit) {
  const { data: trendingProducts, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      discount_price,
      images,
      average_rating,
      total_reviews,
      categories(name)
    `)
    .gt('stock_quantity', 0)
    .order('total_reviews', { ascending: false })
    .order('average_rating', { ascending: false })
    .limit(parseInt(limit));
  
  if (error) throw error;
  
  res.json({
    success: true,
    data: trendingProducts,
    metadata: {
      based_on: 'trending'
    }
  });
}

// POST /api/recommendations/track-view - Track product view for recommendations
router.post('/track-view', optionalAuth, async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user?.id;
    
    if (!userId || !product_id) {
      return res.json({
        success: true,
        message: 'View tracking skipped'
      });
    }
    
    // Record view activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        product_id,
        action_type: 'view'
      });
    
    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Track view error:', error);
    // Don't fail the request if tracking fails
    res.json({
      success: true,
      message: 'View tracking failed but request continued'
    });
  }
});

module.exports = router;