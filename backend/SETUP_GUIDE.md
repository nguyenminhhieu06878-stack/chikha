# 🚀 Hướng dẫn Setup Backend từ đầu

## Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

## Bước 2: Setup Supabase

### 2.1 Tạo Project Supabase

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng nhập hoặc đăng ký tài khoản
3. Click "New Project"
4. Điền thông tin:
   - **Name**: ecommerce-project (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (LƯU LẠI PASSWORD NÀY!)
   - **Region**: Southeast Asia (Singapore) - gần Việt Nam nhất
5. Click "Create new project" và đợi ~2 phút

### 2.2 Lấy API Keys

1. Vào project vừa tạo
2. Click vào **Settings** (icon bánh răng bên trái)
3. Click **API** trong menu Settings
4. Bạn sẽ thấy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: Key này dùng cho client-side
   - **service_role**: Key này dùng cho server-side (có quyền admin)

### 2.3 Tạo file .env

```bash
cp .env.example .env
```

Mở file `.env` và điền:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co          # Copy từ Project URL
SUPABASE_ANON_KEY=eyJhbGc...                    # Copy từ anon public
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...            # Copy từ service_role

# JWT Configuration
JWT_SECRET=my_super_secret_key_12345            # Tạo random string

# ElasticSearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200

# Cloudinary (Optional - để sau)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

**⚠️ LƯU Ý:**
- `SUPABASE_ANON_KEY`: Dùng cho client-side, có thể public
- `SUPABASE_SERVICE_ROLE_KEY`: Dùng cho server-side, KHÔNG BAO GIỜ public key này!
- `JWT_SECRET`: Tạo random string bất kỳ, ví dụ: `my_secret_key_2024`

## Bước 3: Tạo Database Tables

### 3.1 Vào SQL Editor

1. Trong Supabase Dashboard, click **SQL Editor** (icon database bên trái)
2. Click "New query"

### 3.2 Copy & Paste SQL

Mở file `database/supabase-setup.md` và copy từng đoạn SQL, paste vào SQL Editor và chạy:

**Thứ tự tạo tables:**

1. **user_profiles** (tạo đầu tiên)
```sql
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    date_of_birth DATE,
    gender VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **categories**
```sql
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **products**
```sql
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10,2) CHECK (discount_price >= 0 AND discount_price < price),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions JSONB,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **reviews**
```sql
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL CHECK (LENGTH(comment) >= 10),
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);
```

5. **orders**
```sql
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    admin_notes TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

6. **order_items**
```sql
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

7. **cart**
```sql
CREATE TABLE cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

8. **user_activity**
```sql
CREATE TABLE user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('view', 'add_to_cart', 'purchase')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

9. **addresses**
```sql
CREATE TABLE addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Vietnam',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

10. **search_analytics**
```sql
CREATE TABLE search_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    clicked_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Tạo Indexes (Optional - nhưng nên làm)

```sql
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(average_rating);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_product_id ON user_activity(product_id);
```

### 3.4 Enable Row Level Security (RLS)

Vào **Authentication** → **Policies** và enable RLS cho các bảng cần bảo mật:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Policies cho user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies cho cart
CREATE POLICY "Users can manage own cart" ON cart
    FOR ALL USING (auth.uid() = user_id);

-- Policies cho orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Bước 4: Seed Data (Tạo dữ liệu mẫu)

```bash
npm run seed
```

Script này sẽ tạo:
- 5 categories (Electronics, Smartphones, Laptops, Fashion, Home & Garden)
- 10 products mẫu
- Sample reviews

## Bước 5: Setup ElasticSearch (Optional)

### Option 1: Docker (Khuyến nghị)

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0
```

### Option 2: Bỏ qua ElasticSearch

Nếu không cài ElasticSearch, API sẽ tự động fallback về database search.

## Bước 6: Chạy Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

## Bước 7: Test API

```bash
npm run test-api
```

Hoặc test thủ công:

```bash
# Health check
curl http://localhost:5000/health

# Get categories
curl http://localhost:5000/api/categories

# Get products
curl http://localhost:5000/api/products
```

## Bước 8: Tạo Admin User (Optional)

1. Vào Supabase Dashboard → **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Điền:
   - Email: admin@example.com
   - Password: admin123456
   - Auto Confirm User: ✅ (check)
4. Click "Create user"
5. Copy User ID (UUID)
6. Vào **SQL Editor** và chạy:

```sql
INSERT INTO user_profiles (id, full_name, phone, role)
VALUES ('USER_ID_VỪA_COPY', 'Admin User', '+84123456789', 'admin');
```

## ✅ Checklist

- [ ] Đã tạo Supabase project
- [ ] Đã copy API keys vào .env
- [ ] Đã tạo tất cả tables
- [ ] Đã enable RLS và tạo policies
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run seed`
- [ ] Server chạy thành công (`npm run dev`)
- [ ] Test API thành công (`npm run test-api`)

## 🚨 Troubleshooting

### Lỗi: "relation does not exist"
→ Chưa tạo table, quay lại Bước 3

### Lỗi: "Invalid API key"
→ Check lại SUPABASE_URL và SUPABASE_ANON_KEY trong .env

### Lỗi: "permission denied"
→ Cần dùng SUPABASE_SERVICE_ROLE_KEY cho admin operations

### Server không start
→ Check port 5000 có bị chiếm không: `lsof -i :5000`

### Không có data
→ Chạy: `npm run seed`

## 📞 Cần giúp đỡ?

Check logs trong console để debug. Hầu hết lỗi đều có message rõ ràng.

---

**Chúc bạn setup thành công! 🎉**