# Thuật Toán Trending Products - AI-Inspired

## Tổng Quan
Hệ thống sử dụng thuật toán **scoring đa yếu tố** (giống AI) để xác định sản phẩm trending, không phải AI thực sự nhưng mô phỏng cách AI phân tích dữ liệu.

## Công Thức Tính Điểm Trending

```
Trending Score = (Đơn hàng × 10) + (Lượt xem × 0.1) + (Rating × 2) + (Reviews × 1)
```

### Trọng Số Các Yếu Tố:

1. **Đơn hàng (Orders)** - Trọng số: 10
   - Yếu tố quan trọng nhất
   - Chỉ tính đơn hàng trong 30 ngày gần đây
   - Phản ánh hành vi mua thực tế

2. **Lượt xem (Views)** - Trọng số: 0.1
   - Chỉ tính lượt xem trong 30 ngày gần đây
   - Phản ánh sự quan tâm của người dùng
   - Trọng số thấp vì dễ bị spam

3. **Đánh giá (Rating)** - Trọng số: 2
   - Đánh giá trung bình từ reviews
   - Phản ánh chất lượng sản phẩm
   - Giúp sản phẩm tốt lên top

4. **Số lượng Reviews** - Trọng số: 1
   - Số lượng đánh giá
   - Phản ánh độ tin cậy
   - Sản phẩm nhiều review = đáng tin hơn

## Ví Dụ Tính Toán

### Sản phẩm A:
- 9 đơn hàng
- 90 lượt xem
- Rating 5.0
- 1 review

**Score = (9 × 10) + (90 × 0.1) + (5.0 × 2) + (1 × 1) = 90 + 9 + 10 + 1 = 110**

### Sản phẩm B:
- 8 đơn hàng
- 100 lượt xem
- Rating 0
- 0 review

**Score = (8 × 10) + (100 × 0.1) + (0 × 2) + (0 × 1) = 80 + 10 + 0 + 0 = 90**

→ **Sản phẩm A trending hơn** vì có nhiều đơn hàng và rating tốt

## Cách Hoạt Động

### 1. Thu Thập Dữ Liệu
```sql
- Đếm đơn hàng trong 30 ngày: COUNT(DISTINCT orders)
- Đếm lượt xem trong 30 ngày: COUNT(DISTINCT views)
- Tính rating trung bình: AVG(rating)
- Đếm số reviews: COUNT(DISTINCT reviews)
```

### 2. Tính Điểm
```sql
trending_score = 
  (order_count * 10) + 
  (view_count * 0.1) + 
  (avg_rating * 2) + 
  (review_count * 1)
```

### 3. Sắp Xếp
```sql
ORDER BY 
  trending_score DESC,  -- Ưu tiên điểm cao nhất
  order_count DESC,     -- Nếu bằng điểm, ưu tiên đơn hàng
  view_count DESC       -- Cuối cùng ưu tiên lượt xem
```

## Tracking Dữ Liệu

### Track Lượt Xem
```javascript
// Frontend gọi khi user xem sản phẩm
POST /api/recommendations/track-view
{
  "product_id": 123
}
```

### Track Đơn Hàng
- Tự động khi user đặt hàng
- Lưu vào bảng `orders` và `order_items`

### Track Reviews
- User viết review sau khi mua
- Lưu vào bảng `reviews`

## Tại Sao Không Dùng AI Thực Sự?

1. **Đơn giản hơn**: Không cần train model
2. **Nhanh hơn**: Query SQL trực tiếp
3. **Minh bạch**: Dễ debug và điều chỉnh
4. **Đủ tốt**: Cho hầu hết e-commerce

## Nâng Cấp Lên AI Thực

Nếu muốn dùng AI thực sự:

1. **Machine Learning Model**
   - Train model với dữ liệu lịch sử
   - Dự đoán sản phẩm sẽ trending
   - Cần Python + TensorFlow/PyTorch

2. **Collaborative Filtering**
   - Phân tích hành vi user
   - "User A mua X, user B giống A → gợi ý X cho B"

3. **Deep Learning**
   - Neural network phân tích pattern
   - Tốn nhiều tài nguyên

## Kết Luận

Thuật toán hiện tại là **"AI-inspired"** - lấy ý tưởng từ AI nhưng implement bằng SQL đơn giản. Nó:

✅ Phân tích đa yếu tố (như AI)
✅ Có trọng số thông minh
✅ Cập nhật real-time
✅ Dễ maintain
✅ Performance tốt

Đủ tốt cho đồ án và hầu hết ứng dụng thực tế!
