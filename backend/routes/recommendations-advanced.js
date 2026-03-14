const express = require('express');
const { supabase } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get personalized recommendations for user
router.get('/personalized', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 10, type = 'mixed' } = req.query;

    if (!userId) {
      // Return popular products for anonymous users
      return getPopularProducts(res, limit);
    }

    let recommendations = [];

    switch (type) {
      case 'collaborative':
        recommendations = await getCollaborativeRecommendations(userId, limit);
        break;
      case 'content':
        recommendations = await getContentBasedRecommendations(userId, limit);
        break;
      case 'trending':
        recommendations = await getTrendingProducts(limit);
        break;
      default: // mixed
        recommendations = await getMixedRecommendations(userId, limit);
    }

    // Log recommendation view
    if (recommendations.length > 0) {
      await logUserActivity(userId, null, 'recommendation_view', {
        type,
        count: recommendations.length
      });
    }

    res.json({
      success: true,
      data: recommendations,
      type,
      personalized: !!userId
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get similar products (content-based)
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;

    // Get the current product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('category_id, price, name')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // Find similar products in same category with similar price range
    const priceRange = product.price * 0.3; // 30% price range
    
    const { data: similarProducts, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('category_id', product.category_id)
      .neq('id', productId)
      .gte('price', product.price - priceRange)
      .lte('price', product.price + priceRange)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    // If not enough similar products, get more from same category
    if (similarProducts.length < limit) {
      const { data: moreProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug)
        `)
        .eq('category_id', product.category_id)
        .neq('id', productId)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(parseInt(limit) - similarProducts.length);

      if (moreProducts) {
        similarProducts.push(...moreProducts);
      }
    }

    res.json({
      success: true,
      data: similarProducts || [],
      based_on: product.name
    });
  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get "customers also bought" recommendations
router.get('/also-bought/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    // Find orders that contain this product
    const { data: ordersWithProduct } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId);

    if (!ordersWithProduct || ordersWithProduct.length === 0) {
      // Fallback to similar products
      const { data: fallback } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug)
        `)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(parseInt(limit));

      return res.json({
        success: true,
        data: fallback || [],
        fallback: true
      });
    }

    const orderIds = ordersWithProduct.map(item => item.order_id);

    // Find other products in those orders
    const { data: alsoBoughtItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products (
          *,
          categories (name, slug)
        )
      `)
      .in('order_id', orderIds)
      .neq('product_id', productId);

    // Count frequency and calculate scores
    const productScores = {};
    alsoBoughtItems?.forEach(item => {
      if (item.products && item.products.is_active) {
        const id = item.product_id;
        const score = item.quantity * (item.products.average_rating || 1);
        productScores[id] = (productScores[id] || 0) + score;
      }
    });

    // Sort by score and get top products
    const sortedProducts = Object.entries(productScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => {
        return alsoBoughtItems.find(item => item.product_id === productId)?.products;
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: sortedProducts
    });
  } catch (error) {
    console.error('Also bought error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const { limit = 12, period = '7d' } = req.query;
    
    const recommendations = await getTrendingProducts(limit, period);
    
    res.json({
      success: true,
      data: recommendations,
      period
    });
  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recommendations for homepage
router.get('/homepage', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const sections = {
      trending: await getTrendingProducts(8),
      popular: await getPopularProducts(null, 8),
      new_arrivals: await getNewArrivals(8)
    };

    if (userId) {
      sections.for_you = await getMixedRecommendations(userId, 8);
      sections.based_on_history = await getContentBasedRecommendations(userId, 6);
    }

    res.json({
      success: true,
      data: sections,
      personalized: !!userId
    });
  } catch (error) {
    console.error('Homepage recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Collaborative Filtering Implementation
async function getCollaborativeRecommendations(userId, limit) {
  try {
    // Get user's activity history
    const { data: userActivities } = await supabase
      .from('user_activities')
      .select('product_id, activity_type')
      .eq('user_id', userId)
      .in('activity_type', ['purchase', 'add_to_cart', 'view']);

    if (!userActivities || userActivities.length === 0) {
      return await getContentBasedRecommendations(userId, limit);
    }

    const userProductIds = userActivities.map(a => a.product_id);

    // Find users with similar activity patterns
    const { data: similarUserActivities } = await supabase
      .from('user_activities')
      .select('user_id, product_id, activity_type')
      .in('product_id', userProductIds)
      .neq('user_id', userId)
      .in('activity_type', ['purchase', 'add_to_cart']);

    // Calculate user similarity scores
    const userSimilarity = {};
    similarUserActivities?.forEach(activity => {
      const otherUserId = activity.user_id;
      if (!userSimilarity[otherUserId]) {
        userSimilarity[otherUserId] = 0;
      }
      // Weight: purchase = 3, add_to_cart = 2, view = 1
      const weight = activity.activity_type === 'purchase' ? 3 : 2;
      userSimilarity[otherUserId] += weight;
    });

    // Get top similar users
    const similarUsers = Object.entries(userSimilarity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId]) => userId);

    if (similarUsers.length === 0) {
      return await getContentBasedRecommendations(userId, limit);
    }

    // Get products that similar users liked but current user hasn't interacted with
    const { data: recommendations } = await supabase
      .from('user_activities')
      .select(`
        product_id,
        activity_type,
        products (
          *,
          categories (name, slug)
        )
      `)
      .in('user_id', similarUsers)
      .in('activity_type', ['purchase', 'add_to_cart'])
      .not('product_id', 'in', `(${userProductIds.map(id => `'${id}'`).join(',')})`);

    // Score products based on activity type and frequency
    const productScores = {};
    recommendations?.forEach(item => {
      if (item.products && item.products.is_active) {
        const productId = item.product_id;
        const weight = item.activity_type === 'purchase' ? 3 : 2;
        productScores[productId] = (productScores[productId] || 0) + weight;
      }
    });

    const sortedProducts = Object.entries(productScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => {
        return recommendations.find(r => r.product_id === productId)?.products;
      })
      .filter(Boolean);

    return sortedProducts;
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return await getContentBasedRecommendations(userId, limit);
  }
}

// Content-Based Filtering Implementation
async function getContentBasedRecommendations(userId, limit) {
  try {
    // Get user's purchase and view history
    const { data: userHistory } = await supabase
      .from('user_activities')
      .select(`
        product_id,
        activity_type,
        products (category_id, price)
      `)
      .eq('user_id', userId)
      .in('activity_type', ['purchase', 'add_to_cart', 'view'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (!userHistory || userHistory.length === 0) {
      return await getPopularProducts(null, limit);
    }

    // Analyze user preferences
    const categoryPreferences = {};
    const priceRanges = [];
    
    userHistory.forEach(activity => {
      if (activity.products) {
        const categoryId = activity.products.category_id;
        const weight = activity.activity_type === 'purchase' ? 3 : 
                      activity.activity_type === 'add_to_cart' ? 2 : 1;
        
        categoryPreferences[categoryId] = (categoryPreferences[categoryId] || 0) + weight;
        priceRanges.push(activity.products.price);
      }
    });

    // Get preferred categories
    const topCategories = Object.entries(categoryPreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoryId]) => categoryId);

    // Calculate preferred price range
    const avgPrice = priceRanges.reduce((sum, price) => sum + price, 0) / priceRanges.length;
    const priceRange = avgPrice * 0.5; // 50% range

    // Get viewed/purchased product IDs to exclude
    const excludeIds = userHistory.map(h => h.product_id);

    // Find recommendations based on preferences
    const { data: recommendations } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .in('category_id', topCategories)
      .not('id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',')})`)
      .gte('price', Math.max(0, avgPrice - priceRange))
      .lte('price', avgPrice + priceRange)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(parseInt(limit));

    return recommendations || [];
  } catch (error) {
    console.error('Content-based filtering error:', error);
    return await getPopularProducts(null, limit);
  }
}

// Mixed Recommendations (Hybrid Approach)
async function getMixedRecommendations(userId, limit) {
  try {
    const collaborativeLimit = Math.ceil(limit * 0.6); // 60% collaborative
    const contentLimit = limit - collaborativeLimit; // 40% content-based

    const [collaborative, contentBased] = await Promise.all([
      getCollaborativeRecommendations(userId, collaborativeLimit),
      getContentBasedRecommendations(userId, contentLimit)
    ]);

    // Merge and remove duplicates
    const seen = new Set();
    const mixed = [];

    [...collaborative, ...contentBased].forEach(product => {
      if (product && !seen.has(product.id)) {
        seen.add(product.id);
        mixed.push(product);
      }
    });

    return mixed.slice(0, limit);
  } catch (error) {
    console.error('Mixed recommendations error:', error);
    return await getPopularProducts(null, limit);
  }
}

// Get trending products
async function getTrendingProducts(limit, period = '7d') {
  try {
    let dateFilter = new Date();
    switch (period) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
    }

    const { data: trending } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('is_active', true)
      .gte('created_at', dateFilter.toISOString())
      .order('popularity_score', { ascending: false })
      .limit(parseInt(limit));

    return trending || [];
  } catch (error) {
    console.error('Trending products error:', error);
    return [];
  }
}

// Get popular products
async function getPopularProducts(res, limit) {
  try {
    const { data: popular } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .order('total_reviews', { ascending: false })
      .limit(parseInt(limit));

    const result = popular || [];
    
    if (res) {
      return res.json({
        success: true,
        data: result,
        type: 'popular',
        personalized: false
      });
    }
    
    return result;
  } catch (error) {
    console.error('Popular products error:', error);
    if (res) {
      return res.status(500).json({ error: error.message });
    }
    return [];
  }
}

// Get new arrivals
async function getNewArrivals(limit) {
  try {
    const { data: newProducts } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    return newProducts || [];
  } catch (error) {
    console.error('New arrivals error:', error);
    return [];
  }
}

// Helper function to log user activity
async function logUserActivity(userId, productId, activityType, metadata = {}) {
  try {
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        product_id: productId,
        activity_type: activityType,
        metadata
      });
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
}

module.exports = router;