const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateProductStock() {
  try {
    console.log('🔄 Updating product stock quantities...');
    
    // Update all products with random stock quantities between 10-100
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name');
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }
    
    console.log(`📦 Found ${products.length} products to update`);
    
    for (const product of products) {
      const stockQuantity = Math.floor(Math.random() * 91) + 10; // Random between 10-100
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: stockQuantity })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating ${product.name}:`, updateError);
      } else {
        console.log(`✅ Updated ${product.name}: ${stockQuantity} units`);
      }
    }
    
    console.log('🎉 Stock update completed!');
    
  } catch (error) {
    console.error('Error updating stock:', error);
  }
}

updateProductStock();