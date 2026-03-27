# 🎯 Hệ thống Gợi ý Sản phẩm (Recommendation System)

## Tổng quan

Hệ thống gợi ý thông minh **KHÔNG CẦN AI/ML** - sử dụng thuật toán dựa trên dữ liệu người dùng và hành vi mua sắm.

---

## 🚀 Các loại Recommendations

### 1. **Personalized Recommendations** (Gợi ý cá nhân hóa)
**Endpoint:** `GET /api/recommendations`

**Cách hoạt động:**
- Phân tích lịch sử mua hàng của user
- Phân tích wishlist
- Gợi ý sản phẩm từ danh mục yêu thích
- Loại trừ sản phẩm đã mua
- Ưu tiên sản phẩm có rating cao

**Ví dụ:**
```bash
GET /api/recommendations?limit=8
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [...products],
  "personalized": true
}
```

---

### 2. **Trending Products** (Sản phẩm đang hot)
**Endpoint:** `GET /api/recommendations/trending`

**Cách hoạt động:**
- Dựa trên số lượng bán gần đây
- Sản phẩm được xem nhiều
- Sản phẩm featured

**Ví dụ:**
```bash
GET /api/recommendations/trending?limit=6
```

---

### 3. **Related Products** (Sản phẩm liên quan)
**Endpoint:** `GET /api/recommendations/product/:productId`

**Cách hoạt động:**
- Cùng danh mục
- Khoảng giá tương tự (±30%)
- Sản phẩm thường được mua cùng

**Ví dụ:**
```bash
GET /api/recommendations/product/1?limit=4
```

---

### 4. **Activity Tracking** (Theo dõi hành vi)
**Endpoint:** `POST /api/recommendations/track`

**Mục đích:** Thu thập dữ liệu để cải thiện gợi ý

**Các action types:**
- `view` - Xem sản phẩm
- `add_to_cart` - Thêm vào giỏ
- `purchase` - Mua hàng
- `wishlist` - Thêm vào wishlist

**Ví dụ:**
```bash
POST /api/recommendations/track
Content-Type: application/json
Authorization: Bearer {token}

{
  "product_id": 1,
  "action_type": "view"
}
```

---

## 🧠 Thuật toán

### Scoring System (Hệ thống chấm điểm)

Mỗi sản phẩm được chấm điểm dựa trên:

1. **Category Match** (Khớp danh mục): +3 điểm
   - Sản phẩm cùng danh mục với sản phẩm user đã mua/xem

2. **Price Range** (Khoảng giá): +2 điểm
   - Giá trong khoảng ±30% so với sản phẩm đang xem

3. **Frequently Bought Together** (Mua cùng): +5 điểm
   - Sản phẩm thường được mua cùng nhau

4. **Rating** (Đánh giá): Sắp xếp theo rating cao
   - Ưu tiên sản phẩm có rating trung bình cao

5. **Sales Count** (Số lượng bán): Sắp xếp theo bán chạy
   - Sản phẩm bán nhiều được ưu tiên

---

## 📊 Database Schema

### user_activity table
```sql
CREATE TABLE user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  product_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
```

**Action types:**
- `view` - Xem sản phẩm
- `add_to_cart` - Thêm vào giỏ
- `purchase` - Mua hàng
- `wishlist` - Thêm vào wishlist

---

## 🎯 Ưu điểm

✅ **Không cần AI/ML phức tạp** - Dễ hiểu, dễ maintain
✅ **Real-time** - Cập nhật ngay lập tức
✅ **Personalized** - Khác nhau cho mỗi user
✅ **Scalable** - Có thể mở rộng thêm thuật toán
✅ **Privacy-friendly** - Dữ liệu lưu local

---

## 📈 Có thể nâng cấp

### Phase 2: Collaborative Filtering
- "Người dùng giống bạn cũng mua..."
- Tìm users có hành vi tương tự

### Phase 3: Content-Based Filtering
- Phân tích mô tả sản phẩm
- Tags, attributes matching

### Phase 4: Hybrid System
- Kết hợp nhiều phương pháp
- Weighted scoring

### Phase 5: Machine Learning
- TensorFlow.js
- Recommendation models
- Deep learning

---

## 🧪 Test Recommendations

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}' \
  -s | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Get personalized recommendations
curl http://localhost:3001/api/recommendations?limit=8 \
  -H "Authorization: Bearer $TOKEN" -s

# 3. Get trending products
curl http://localhost:3001/api/recommendations/trending?limit=6 -s

# 4. Get related products
curl http://localhost:3001/api/recommendations/product/1?limit=4 -s

# 5. Track activity
curl -X POST http://localhost:3001/api/recommendations/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id":1,"action_type":"view"}' -s
```

---

## 💡 Best Practices

1. **Track mọi hành vi quan trọng**
   - View product
   - Add to cart
   - Purchase
   - Wishlist

2. **Cập nhật recommendations thường xuyên**
   - Sau mỗi purchase
   - Sau khi thêm wishlist
   - Định kỳ mỗi ngày

3. **A/B Testing**
   - Test các thuật toán khác nhau
   - Đo lường conversion rate

4. **Performance**
   - Cache recommendations
   - Index database properly
   - Limit query complexity

---

## 📝 Kết luận

Hệ thống recommendation này:
- ✅ Hoạt động tốt cho đồ án tốt nghiệp
- ✅ Không cần API key hay service ngoài
- ✅ Dễ demo và giải thích
- ✅ Có thể nâng cấp sau này
- ✅ Thể hiện được kỹ năng lập trình

**Phù hợp cho:** Đồ án tốt nghiệp, startup MVP, small-medium e-commerce
