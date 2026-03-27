const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate product embeddings using Groq AI
 * @param {string} text - Product name and description
 * @returns {Array} - Embedding vector
 */
async function generateEmbedding(text) {
  try {
    // Use Groq to analyze product text and generate semantic understanding
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a product analysis AI. Extract key features, category, and characteristics from product descriptions. Return a JSON with: category, features (array), price_range (low/mid/high), target_audience."
        },
        {
          role: "user",
          content: `Analyze this product: ${text}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('Groq embedding error:', error);
    return null;
  }
}

/**
 * Get AI-powered product recommendations
 * @param {Object} userProfile - User preferences and history
 * @param {Array} products - Available products
 * @returns {Array} - Recommended product IDs with scores
 */
async function getAIRecommendations(userProfile, products) {
  try {
    const prompt = `
Given a user profile and product list, recommend the best products.

User Profile:
- Purchased categories: ${userProfile.purchasedCategories?.join(', ') || 'None'}
- Wishlist categories: ${userProfile.wishlistCategories?.join(', ') || 'None'}
- Price range preference: ${userProfile.avgPrice || 'Any'}
- Recent views: ${userProfile.recentViews?.join(', ') || 'None'}

Available Products:
${products.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category_name}, Price: ${p.price}`).join('\n')}

Return a JSON array of recommended product IDs sorted by relevance (most relevant first).
Format: {"recommendations": [1, 5, 3, ...]}
Limit to top 8 products.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an e-commerce recommendation AI. Analyze user preferences and suggest the most relevant products based on their history and behavior patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Groq recommendations error:', error);
    return [];
  }
}

/**
 * Find similar products using AI
 * @param {Object} product - Source product
 * @param {Array} candidates - Candidate products
 * @returns {Array} - Similar product IDs
 */
async function findSimilarProducts(product, candidates) {
  try {
    const prompt = `
Find products similar to:
Product: ${product.name}
Description: ${product.description || 'N/A'}
Category: ${product.category_name}
Price: ${product.price}

Candidate Products:
${candidates.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category_name}, Price: ${p.price}, Description: ${p.description || 'N/A'}`).join('\n')}

Return a JSON array of similar product IDs sorted by similarity (most similar first).
Consider: category match, price similarity, feature overlap, use case similarity.
Format: {"similar": [2, 7, 4, ...]}
Limit to top 6 products.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a product similarity AI. Find products that are similar based on features, category, price range, and use cases."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.similar || [];
  } catch (error) {
    console.error('Groq similar products error:', error);
    return [];
  }
}

/**
 * Generate personalized product descriptions
 * @param {Object} product - Product details
 * @param {Object} userProfile - User preferences
 * @returns {string} - Personalized description
 */
async function generatePersonalizedDescription(product, userProfile) {
  try {
    const prompt = `
Generate a personalized product highlight for this user.

Product: ${product.name}
Description: ${product.description || 'N/A'}
Price: ${product.price}

User Profile:
- Interests: ${userProfile.interests?.join(', ') || 'General'}
- Previous purchases: ${userProfile.purchasedCategories?.join(', ') || 'None'}

Write a short, compelling 2-sentence highlight that appeals to this user's interests.
Focus on benefits relevant to their profile.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a marketing copywriter. Create personalized, compelling product highlights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq description error:', error);
    return product.description;
  }
}

/**
 * Check if Groq is configured
 * @returns {boolean}
 */
function isGroqConfigured() {
  return !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
}

module.exports = {
  generateEmbedding,
  getAIRecommendations,
  findSimilarProducts,
  generatePersonalizedDescription,
  isGroqConfigured
};
