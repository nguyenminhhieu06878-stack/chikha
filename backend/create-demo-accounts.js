const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDemoAccounts() {
  console.log('🔐 Creating demo accounts...\n');

  try {
    // 1. Create Admin Account
    console.log('👑 Creating Admin account...');
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true
    });

    if (adminAuthError && !adminAuthError.message.includes('already registered')) {
      console.error('Admin auth creation error:', adminAuthError);
      throw adminAuthError;
    }

    if (adminAuth.user) {
      // Create admin profile
      const { error: adminProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: adminAuth.user.id,
          full_name: 'Admin User',
          phone: '+84123456789',
          role: 'admin'
        });

      if (adminProfileError) {
        console.error('Admin profile creation error:', adminProfileError);
      } else {
        console.log('✅ Admin account created successfully');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
        console.log('   Role: admin');
      }
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // 2. Create Customer Account
    console.log('\n👤 Creating Customer account...');
    const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
      email: 'customer@example.com',
      password: 'password123',
      email_confirm: true
    });

    if (customerAuthError && !customerAuthError.message.includes('already registered')) {
      console.error('Customer auth creation error:', customerAuthError);
      throw customerAuthError;
    }

    if (customerAuth.user) {
      // Create customer profile
      const { error: customerProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: customerAuth.user.id,
          full_name: 'Demo Customer',
          phone: '+84987654321',
          role: 'customer'
        });

      if (customerProfileError) {
        console.error('Customer profile creation error:', customerProfileError);
      } else {
        console.log('✅ Customer account created successfully');
        console.log('   Email: customer@example.com');
        console.log('   Password: password123');
        console.log('   Role: customer');
      }
    } else {
      console.log('ℹ️  Customer account already exists');
    }

    // 3. Create additional test customer
    console.log('\n👤 Creating Test Customer 2...');
    const { data: customer2Auth, error: customer2AuthError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123',
      email_confirm: true
    });

    if (customer2AuthError && !customer2AuthError.message.includes('already registered')) {
      console.error('Test customer auth creation error:', customer2AuthError);
    }

    if (customer2Auth.user) {
      const { error: customer2ProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: customer2Auth.user.id,
          full_name: 'Test User',
          phone: '+84111222333',
          role: 'customer'
        });

      if (customer2ProfileError) {
        console.error('Test customer profile creation error:', customer2ProfileError);
      } else {
        console.log('✅ Test Customer account created successfully');
        console.log('   Email: test@example.com');
        console.log('   Password: test123');
        console.log('   Role: customer');
      }
    } else {
      console.log('ℹ️  Test customer account already exists');
    }

    console.log('\n🎉 Demo accounts setup completed!');
    console.log('\n📋 Available accounts:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    DEMO ACCOUNTS                        │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ ADMIN ACCOUNT:                                          │');
    console.log('│   Email: admin@example.com                              │');
    console.log('│   Password: admin123                                    │');
    console.log('│   Role: Admin (full access)                             │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ CUSTOMER ACCOUNT:                                       │');
    console.log('│   Email: customer@example.com                           │');
    console.log('│   Password: password123                                 │');
    console.log('│   Role: Customer (normal user)                          │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ TEST CUSTOMER:                                          │');
    console.log('│   Email: test@example.com                               │');
    console.log('│   Password: test123                                     │');
    console.log('│   Role: Customer (for testing)                          │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🌐 Login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Demo accounts creation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createDemoAccounts();
}

module.exports = { createDemoAccounts };