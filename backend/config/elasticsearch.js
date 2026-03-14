const { Client } = require('@elastic/elasticsearch');

// ElasticSearch configuration
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  },
  // For development - ignore SSL certificate issues
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
const testConnection = async () => {
  try {
    const health = await client.cluster.health();
    console.log('✅ ElasticSearch connected:', health.cluster_name);
    return true;
  } catch (error) {
    console.log('❌ ElasticSearch connection failed:', error.message);
    return false;
  }
};

// Create products index
const createProductsIndex = async () => {
  try {
    const indexExists = await client.indices.exists({ index: 'products' });
    
    if (!indexExists) {
      await client.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { 
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' }
                }
              },
              description: { type: 'text', analyzer: 'standard' },
              price: { type: 'float' },
              discount_price: { type: 'float' },
              category_id: { type: 'keyword' },
              category_name: { type: 'keyword' },
              stock_quantity: { type: 'integer' },
              average_rating: { type: 'float' },
              total_reviews: { type: 'integer' },
              images: { type: 'keyword' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                autocomplete: {
                  tokenizer: 'autocomplete',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          }
        }
      });
      console.log('✅ Products index created');
    }
  } catch (error) {
    console.log('❌ Failed to create products index:', error.message);
  }
};

// Initialize ElasticSearch
const initializeElasticSearch = async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    await createProductsIndex();
  }
};

module.exports = {
  client,
  testConnection,
  createProductsIndex,
  initializeElasticSearch
};