# Hướng dẫn tạo dữ liệu Trending Products

## Vấn đề
Trang chủ không hiển thị sản phẩm trending vì chưa có đủ dữ liệu đơn hàng.

## Giải pháp
Chạy script để tạo dữ liệu đơn hàng mẫu:

```bash
cd backend
node seed-trending-data.js
```

## Script sẽ làm gì?
- Tạo 30 đơn hàng mẫu trong 30 ngày gần đây
- Mỗi đơn hàng có 1-3 sản phẩm ngẫu nhiên
- Các đơn hàng có trạng thái khác nhau (pending, processing, shipped, delivered)
- Sản phẩm nào được đặt nhiều nhất sẽ hiện ở mục "Trending Now"

## Cách hoạt động của Trending
Sản phẩm trending được tính dựa trên:
1. Số lượng đơn hàng trong 30 ngày gần đây (ưu tiên cao nhất)
2. Đánh giá trung bình của sản phẩm
3. Số lượng review

## Kiểm tra kết quả
1. Mở trang chủ: http://localhost:3000
2. Cuộn xuống phần "Trending Now"
3. Bạn sẽ thấy 6 sản phẩm được đặt hàng nhiều nhất

## Lưu ý
- Script sử dụng user đầu tiên trong database
- Nếu chưa có user nào, script sẽ tạo user demo
- Có thể chạy script nhiều lần để tăng số lượng đơn hàng
