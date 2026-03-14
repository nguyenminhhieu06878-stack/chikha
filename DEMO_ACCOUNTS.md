# 🔐 Demo Accounts

Hệ thống e-commerce đã được tạo sẵn các tài khoản demo để test các chức năng khác nhau.

## 📋 Danh sách tài khoản

### 👑 Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Quyền hạn:**
  - Xem tất cả đơn hàng
  - Quản lý trạng thái đơn hàng
  - Truy cập các API quản trị
  - Tất cả quyền của customer

### 👤 Customer Account
- **Email:** `customer@example.com`
- **Password:** `password123`
- **Role:** `customer`
- **Quyền hạn:**
  - Mua sắm và đặt hàng
  - Xem lịch sử đơn hàng của mình
  - Viết review sản phẩm
  - Quản lý giỏ hàng

### 🧪 Test Customer
- **Email:** `test@example.com`
- **Password:** `test123`
- **Role:** `customer`
- **Mục đích:** Dành cho testing và demo

## 🌐 Cách sử dụng

1. Truy cập: http://localhost:3000/login
2. Chọn một trong các tài khoản trên
3. Nhập email và password
4. Đăng nhập và test các chức năng

## 🔧 Tạo tài khoản mới

Để tạo thêm tài khoản demo:

```bash
cd backend
npm run create-accounts
```

## 📝 Lưu ý

- Tài khoản admin có thể xem và quản lý tất cả dữ liệu
- Tài khoản customer chỉ có thể truy cập dữ liệu của mình
- Tất cả tài khoản đều đã được xác thực email
- Mật khẩu có thể thay đổi sau khi đăng nhập

## 🔒 Bảo mật

- Trong production, hãy thay đổi tất cả mật khẩu mặc định
- Xóa hoặc vô hiệu hóa các tài khoản demo
- Sử dụng mật khẩu mạnh và xác thực 2 yếu tố