const { client } = require('../config/elasticsearch');
const db = require('../config/database');

/**
 * Index a single product to ElasticSearch
 */
const indexProduct = async (productId) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Parse images if string
    if (typeof product.images === 'string') {
      product.images = JSON.parse(product.images);
    }

    await client.index({
      index: 'products',
      id: product.id.toString(),
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price,
        category_id: product.category_id,
        category_name: product.category_name,
        stock_quantity: product.stock_quantity,
        average_rating: product.average_rating || 0,
        total_reviews: product.total_reviews || 0,
        images: product.images,
        created_at: product.created_at,
        updated_at: product.updated_at
      }
    });

    console.log(`✅ Indexed product ${productId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to index product ${productId}:`, error.message);
    return false;
  }
};

/**
 * Index all products to ElasticSearch
 */
const indexAllProducts = async () => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `).all();

    const operations = products.flatMap(product => {
      // Parse images if string
      if (typeof product.images === 'string') {
        product.images = JSON.parse(product.images);
      }

      return [
        { index: { _index: 'products', _id: product.id.toString() } },
        {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          discount_price: product.discount_price,
          category_id: product.category_id,
          category_name: product.category_name,
          stock_quantity: product.stock_quantity,
          average_rating: product.average_rating || 0,
          total_reviews: product.total_reviews || 0,
          images: product.images,
          created_at: product.created_at,
          updated_at: product.updated_at
        }
      ];
    });

    if (operations.length > 0) {
      const result = await client.bulk({ operations, refresh: true });
      console.log(`✅ Indexed ${products.length} products`);
      return { success: true, count: products.length };
    }

    return { success: true, count: 0 };
  } catch (error) {
    console.error('❌ Failed to index all products:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete product from ElasticSearch
 */
const deleteProduct = async (productId) => {
  try {
    await client.delete({
      index: 'products',
      id: productId.toString()
    });
    console.log(`✅ Deleted product ${productId} from index`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete product ${productId}:`, error.message);
    return false;
  }
};

/**
 * Search products with advanced features
 */
const searchProducts = async (query, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'relevance',
      fuzzy = true
    } = options;

    const from = (page - 1) * limit;

    // Build query
    const must = [];
    const filter = [];

    // Main search query
    if (query && query.trim()) {
      if (fuzzy) {
        must.push({
          multi_match: {
            query: query,
            fields: ['name^3', 'description', 'category_name^2'],
            fuzziness: 'AUTO',
            prefix_length: 2
          }
        });
      } else {
        must.push({
          multi_match: {
            query: query,
            fields: ['name^3', 'description', 'category_name^2']
          }
        });
      }
    } else {
      must.push({ match_all: {} });
    }

    // Filters
    if (category) {
      filter.push({ term: { category_id: category } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      filter.push({ range: { price: range } });
    }

    if (minRating !== undefined) {
      filter.push({ range: { average_rating: { gte: minRating } } });
    }

    // Only in-stock products
    filter.push({ range: { stock_quantity: { gt: 0 } } });

    // Sort
    let sort = [];
    switch (sortBy) {
      case 'price_asc':
        sort = [{ price: 'asc' }];
        break;
      case 'price_desc':
        sort = [{ price: 'desc' }];
        break;
      case 'rating':
        sort = [{ average_rating: 'desc' }, { total_reviews: 'desc' }];
        break;
      case 'newest':
        sort = [{ created_at: 'desc' }];
        break;
      default:
        sort = ['_score', { created_at: 'desc' }];
    }

    const result = await client.search({
      index: 'products',
      body: {
        from,
        size: limit,
        query: {
          bool: {
            must,
            filter
          }
        },
        sort,
        highlight: {
          fields: {
            name: {},
            description: {}
          }
        }
      }
    });

    const products = result.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score,
      highlights: hit.highlight
    }));

    return {
      products,
      total: result.hits.total.value,
      page,
      limit,
      totalPages: Math.ceil(result.hits.total.value / limit)
    };
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
};

/**
 * Auto-complete suggestions
 */
const autoComplete = async (query, limit = 10) => {
  try {
    const result = await client.search({
      index: 'products',
      body: {
        size: limit,
        query: {
          bool: {
            should: [
              {
                match_phrase_prefix: {
                  name: {
                    query: query,
                    boost: 3
                  }
                }
              },
              {
                match: {
                  name: {
                    query: query,
                    fuzziness: 'AUTO',
                    boost: 2
                  }
                }
              }
            ]
          }
        },
        _source: ['id', 'name', 'price', 'images', 'category_name']
      }
    });

    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('❌ Auto-complete failed:', error.message);
    throw error;
  }
};

/**
 * Get search suggestions (popular searches)
 */
const getSearchSuggestions = async (limit = 10) => {
  try {
    const suggestions = db.prepare(`
      SELECT search_query, COUNT(*) as count
      FROM search_analytics
      WHERE search_query IS NOT NULL AND search_query != ''
      GROUP BY search_query
      ORDER BY count DESC
      LIMIT ?
    `).all(limit);

    return suggestions;
  } catch (error) {
    console.error('❌ Failed to get suggestions:', error.message);
    return [];
  }
};

module.exports = {
  indexProduct,
  indexAllProducts,
  deleteProduct,
  searchProducts,
  autoComplete,
  getSearchSuggestions
};
