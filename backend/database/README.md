# Database Schema

## Overview

Hệ thống sử dụng SQLite với schema đầy đủ cho e-commerce.

## Files

### Main Schema
- `schema-complete.sql` - **File chính chứa toàn bộ schema** (Dùng file này!)
- `ecommerce.db` - SQLite database file
- `seed-data.js` - Seed data script (Supabase version)
- `seed-sqlite.js` - Seed data script (SQLite version)
- `README.md` - This file

## Quick Start

### Option 1: Auto Apply (Recommended)

Schema được tự động apply khi khởi động server:

```bash
npm start
```

### Option 2: Manual Apply

```bash
# Using Node.js script
node apply-schema.js

# Or using sqlite3 CLI
sqlite3 database/ecommerce.db < database/schema-complete.sql
```

## Schema Includes

### 1. Coupon System
- `coupons` - Mã giảm giá
- `coupon_usage` - Lịch sử sử dụng

### 2. Search Analytics
- `search_analytics` - Thống kê tìm kiếm
- `user_activity` - Hoạt động người dùng

### 3. Review System
- `review_votes` - Vote helpful/not helpful
- `review_reports` - Báo cáo vi phạm

### 4. Sample Data
- 5 mã giảm giá mẫu (WELCOME10, SAVE20, FREESHIP, MEGA50, NEWUSER)

## Database Structure

```
ecommerce.db
├── users
├── products
├── categories
├── orders
├── order_items
├── cart_items
├── reviews
├── wishlist
├── addresses
├── coupons (NEW)
├── coupon_usage (NEW)
├── search_analytics (NEW)
├── user_activity (NEW)
├── review_votes (NEW)
└── review_reports (NEW)
```

## Indexes

All tables have appropriate indexes for:
- Foreign keys
- Search queries
- Sorting
- Filtering

## Migrations

### Add google_id to users

```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
```

### Add images to reviews

```sql
ALTER TABLE reviews ADD COLUMN images TEXT DEFAULT '[]';
```

## Backup

```bash
# Backup database
cp database/ecommerce.db database/ecommerce.db.backup

# Restore from backup
cp database/ecommerce.db.backup database/ecommerce.db
```

## Reset Database

```bash
# Delete database
rm database/ecommerce.db

# Restart server (will recreate)
npm start
```

## Verify Schema

```bash
# List all tables
sqlite3 database/ecommerce.db ".tables"

# Show table schema
sqlite3 database/ecommerce.db ".schema coupons"

# Count rows
sqlite3 database/ecommerce.db "SELECT COUNT(*) FROM coupons;"
```

## Notes

- SQLite doesn't support all PostgreSQL features
- Functions and triggers are simplified
- UUIDs are replaced with INTEGER PRIMARY KEY
- JSONB is replaced with TEXT
- Timestamps use DATETIME instead of TIMESTAMP WITH TIME ZONE

## Support

For issues or questions, check:
- `backend/README.md` - Backend documentation
- `backend/SETUP_GUIDE.md` - Setup guide
- `FINAL_STATUS.md` - Project status
