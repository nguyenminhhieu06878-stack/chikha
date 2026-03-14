const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createOrdersTables() {
  try {
    console.log('🔧 Creating orders tables...');

    // Try to create a test order to see if table exists
    const { error: testError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);

    if (testError && testError.code === 'PGRST106') {
      console.log('❌ Orders table does not exist. Please create it manually in Supabase dashboard.');
      console.log('📋 SQL to run in Supabase SQL Editor:');
      console.log(`
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE DEFAULT 'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method VARCHAR(50) DEFAULT 'cod',
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(255),
  notes TEXT,
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
      `);
    } else {
      console.log('✅ Orders table already exists');
    }

    // Test order_items table
    const { error: itemsTestError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .limit(1);

    if (itemsTestError && itemsTestError.code === 'PGRST106') {
      console.log('❌ Order items table does not exist');
    } else {
      console.log('✅ Order items table already exists');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

createOrdersTables();