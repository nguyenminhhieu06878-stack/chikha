const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Sample data
const categories = [
  {
    name: 'Electronics',
    slug: 'electronics'
  },
  {
    name: 'Smartphones',
    slug: 'smartphones'
  },
  {
    name: 'Laptops',
    slug: 'laptops'
  },
  {
    name: 'Fashion',
    slug: 'fashion'
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden'
  }
];

const products = [
  // Electronics - Smartphones
  {
    name: 'iPhone 15 Pro Max',
    description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and professional camera system.',
    price: 1199.99
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen, 200MP camera, and AI-powered features.',
    price: 1299.99
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Google\'s flagship phone with advanced AI photography and pure Android experience.',
    price: 999.99
  },

  // Electronics - Laptops
  {
    name: 'MacBook Pro 16-inch M3 Max',
    description: 'The most powerful MacBook Pro ever with M3 Max chip, up to 128GB unified memory, and stunning Liquid Retina XDR display.',
    price: 3999.99
  },
  {
    name: 'Dell XPS 13 Plus',
    description: 'Ultra-thin laptop with 13.4-inch InfinityEdge display, 12th Gen Intel processors, and premium build quality.',
    price: 1299.99
  },
  {
    name: 'ASUS ROG Strix G15',
    description: 'Gaming laptop with AMD Ryzen 9, NVIDIA RTX 4070, 15.6-inch 144Hz display, and RGB keyboard.',
    price: 1599.99
  },

  // Fashion
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable lifestyle sneakers with large Air unit in the heel and breathable mesh upper.',
    price: 150.00
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight-fit jeans with button fly, made from 100% cotton denim.',
    price: 89.99
  },

  // Home & Garden
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Advanced cordless vacuum with laser dust detection, powerful suction, and up to 60 minutes runtime.',
    price: 749.99
  },
  {
    name: 'Philips Hue Smart Bulb Starter Kit',
    description: 'Smart LED bulbs with 16 million colors, voice control, and smartphone app integration.',
    price: 199.99
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await supabase.from('user_activity').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cart').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert categories
    console.log('📂 Inserting categories...');
    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (categoriesError) {
      console.error('Categories error:', categoriesError);
      throw categoriesError;
    }

    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // 3. Map category names to IDs
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // 4. Assign category IDs to products
    const productsWithCategories = products.map((product, index) => {
      let categoryId;
      
      // Assign categories based on product name/type
      if (product.name.includes('iPhone') || product.name.includes('Samsung') || product.name.includes('Pixel')) {
        categoryId = categoryMap['smartphones'];
      } else if (product.name.includes('MacBook') || product.name.includes('Dell') || product.name.includes('ASUS')) {
        categoryId = categoryMap['laptops'];
      } else if (product.name.includes('Nike') || product.name.includes('Levi')) {
        categoryId = categoryMap['fashion'];
      } else if (product.name.includes('Dyson') || product.name.includes('Philips')) {
        categoryId = categoryMap['home-garden'];
      } else {
        categoryId = categoryMap['electronics'];
      }

      return {
        ...product,
        category_id: categoryId
      };
    });

    // 5. Insert products
    console.log('📱 Inserting products...');
    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(productsWithCategories)
      .select();

    if (productsError) {
      console.error('Products error:', productsError);
      throw productsError;
    }

    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // 6. Create admin user profile (if needed)
    console.log('👤 Creating admin user profile...');
    
    // First, create a test admin user in Supabase Auth (you need to do this manually in Supabase dashboard)
    // Then create the profile
    const adminProfile = {
      id: '00000000-0000-0000-0000-000000000001', // Replace with actual admin user ID
      full_name: 'Admin User',
      phone: '+84123456789',
      role: 'admin'
    };

    // This will fail if the auth user doesn't exist - that's okay for now
    try {
      await supabase.from('user_profiles').insert(adminProfile);
      console.log('✅ Admin profile created');
    } catch (error) {
      console.log('ℹ️  Admin profile creation skipped (auth user not found)');
    }

    // 7. Add some sample reviews
    console.log('⭐ Adding sample reviews...');
    const sampleReviews = [
      {
        product_id: insertedProducts[0].id, // iPhone 15 Pro Max
        user_id: '00000000-0000-0000-0000-000000000001', // Admin user
        rating: 5,
        comment: 'Amazing phone! The camera quality is outstanding and the performance is incredibly smooth.',
        is_verified_purchase: true
      },
      {
        product_id: insertedProducts[1].id, // Samsung Galaxy S24 Ultra
        user_id: '00000000-0000-0000-0000-000000000001',
        rating: 4,
        comment: 'Great phone with excellent S Pen functionality. Battery life could be better.',
        is_verified_purchase: true
      },
      {
        product_id: insertedProducts[3].id, // MacBook Pro
        user_id: '00000000-0000-0000-0000-000000000001',
        rating: 5,
        comment: 'Perfect for professional work. The M3 Max chip handles everything I throw at it.',
        is_verified_purchase: true
      }
    ];

    try {
      await supabase.from('reviews').insert(sampleReviews);
      console.log('✅ Sample reviews added');
    } catch (error) {
      console.log('ℹ️  Sample reviews skipped (user not found)');
    }

    // 8. Update product ratings based on reviews
    console.log('📊 Updating product ratings...');
    for (const product of insertedProducts) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from('products')
          .update({
            average_rating: Math.round(avgRating * 10) / 10,
            total_reviews: reviews.length
          })
          .eq('id', product.id);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Categories: ${insertedCategories.length}`);
    console.log(`   Products: ${insertedProducts.length}`);
    console.log(`   Reviews: ${sampleReviews.length}`);
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };