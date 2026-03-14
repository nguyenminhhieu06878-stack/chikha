# YÊU CẦU ĐỒ ÁN TỐT NGHIỆP
## E-commerce với ElasticSearch + Review + Recommend

---

## 1. THÔNG TIN CHUNG

**Đề tài:** Hệ thống E-commerce tích hợp ElasticSearch, Review và Recommendation

**Loại đồ án:** System Development (Application Based Project)

**Công nghệ chính:**
- ElasticSearch (Tìm kiếm)
- Review System (Đánh giá sản phẩm)
- Recommendation System (Gợi ý sản phẩm)
- Web Application
- Mobile Application (Optional)

---

## 2. PHÂN TÍCH YÊU CẦU

### 2.1 Quyết định quan trọng: Loại hình E-commerce

**Lựa chọn 1: Single Vendor (1 người bán)**
- Giống như: H&M, UniQlo, Zara
- Đơn giản hơn về quản lý
- Phù hợp nếu làm cả Mobile App
- Dễ kiểm soát chất lượng sản phẩm

**Lựa chọn 2: Multi Vendor (Nhiều người bán)**
- Giống như: Shopee, Lazada, Amazon
- Phức tạp hơn về quản lý
- Cần thêm chức năng quản lý seller
- Review và rating phức tạp hơn

**💡 ĐỀ XUẤT:** Chọn Single Vendor để dễ quản lý và tập trung vào Web App chất lượng cao

---

## 3. PHẠM VI DỰ ÁN

### 3.1 Chức năng chính (Core Features)

#### A. Hệ thống Tìm kiếm (ElasticSearch)
- Tìm kiếm sản phẩm theo tên, mô tả
- Tìm kiếm nâng cao (filter theo giá, màu sắc, size, category)
- Auto-complete/Auto-suggest
- Tìm kiếm fuzzy (chịu lỗi chính tả)
- Sắp xếp kết quả (relevance, giá, rating)

#### B. Hệ thống Review (Đánh giá)
- Khách hàng đánh giá sản phẩm (1-5 sao)
- Viết nhận xét chi tiết
- Upload hình ảnh review
- Hiển thị rating trung bình
- Filter review theo số sao

#### C. Hệ thống Recommend (Gợi ý)
- Gợi ý sản phẩm tương tự
- Gợi ý dựa trên lịch sử xem
- Gợi ý dựa trên lịch sử mua
- "Customers also bought" (Khách hàng cũng mua)
- Trending products

#### D. Chức năng E-commerce cơ bản
- Quản lý sản phẩm (CRUD)
- Giỏ hàng (Cart)
- Checkout & Payment
- Quản lý đơn hàng
- Quản lý khách hàng

### 3.2 Nền tảng

**Web Application:**
- Responsive design (Desktop, Tablet, Mobile)
- Customer Portal (Dành cho khách hàng)
- Admin Panel (Quản trị viên)
- Progressive Web App (PWA) - Optional

---

## 4. USE CASE DIAGRAM (Cây chức năng)

### 4.1 Actors (Người dùng)

1. **Guest (Khách vãng lai)**
2. **Customer (Khách hàng đã đăng ký)**
3. **Admin (Quản trị viên)**

### 4.2 Use Cases chính

```
┌─────────────────────────────────────────────────────────────┐
│                    E-COMMERCE SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GUEST                                                      │
│  ├── Xem sản phẩm                                          │
│  ├── Tìm kiếm sản phẩm (ElasticSearch)                    │
│  ├── Xem chi tiết sản phẩm                                 │
│  ├── Xem review sản phẩm                                   │
│  ├── Xem sản phẩm gợi ý                                    │
│  ├── Đăng ký tài khoản                                     │
│  └── Đăng nhập                                             │
│                                                             │
│  CUSTOMER (Kế thừa tất cả chức năng Guest +)              │
│  ├── Quản lý giỏ hàng                                      │
│  │   ├── Thêm vào giỏ                                      │
│  │   ├── Xóa khỏi giỏ                                      │
│  │   └── Cập nhật số lượng                                 │
│  ├── Checkout & Thanh toán                                 │
│  ├── Xem lịch sử đơn hàng                                  │
│  ├── Theo dõi đơn hàng                                     │
│  ├── Viết review sản phẩm                                  │
│  │   ├── Đánh giá sao (1-5)                               │
│  │   ├── Viết nhận xét                                     │
│  │   └── Upload hình ảnh                                   │
│  ├── Quản lý thông tin cá nhân                            │
│  ├── Quản lý địa chỉ giao hàng                            │
│  └── Xem gợi ý cá nhân hóa                                │
│                                                             │
│  ADMIN                                                      │
│  ├── Quản lý sản phẩm                                      │
│  │   ├── Thêm sản phẩm                                     │
│  │   ├── Sửa sản phẩm                                      │
│  │   ├── Xóa sản phẩm                                      │
│  │   └── Đồng bộ với ElasticSearch                        │
│  ├── Quản lý danh mục                                      │
│  ├── Quản lý đơn hàng                                      │
│  │   ├── Xem danh sách đơn hàng                           │
│  │   ├── Cập nhật trạng thái                              │
│  │   └── Xử lý hoàn trả                                    │
│  ├── Quản lý khách hàng                                    │
│  ├── Quản lý review                                        │
│  │   ├── Duyệt review                                      │
│  │   └── Xóa review vi phạm                               │
│  ├── Xem báo cáo thống kê                                  │
│  │   ├── Doanh thu                                         │
│  │   ├── Sản phẩm bán chạy                                │
│  │   └── Từ khóa tìm kiếm phổ biến                        │
│  └── Cấu hình hệ thống                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. KIẾN TRÚC HỆ THỐNG

### 5.1 Tech Stack đề xuất

**Frontend:**
- React.js (Recommended) / Vue.js / Angular
- Tailwind CSS / Material-UI / Bootstrap
- Axios / Fetch API cho API calls
- Redux / Context API (State management)

**Backend:**
- Node.js (Express) / Python (Django/Flask) / Java (Spring Boot)
- RESTful API hoặc GraphQL

**Database:**
- PostgreSQL / MySQL (Dữ liệu chính)
- ElasticSearch (Tìm kiếm)
- Redis (Cache, Session)

**Storage:**
- AWS S3 / Cloudinary (Lưu hình ảnh)

**Recommendation Engine:**
- Collaborative Filtering
- Content-Based Filtering
- Python (Scikit-learn, Pandas)

---

## 6. CƠ SỞ DỮ LIỆU

### 6.1 Các bảng chính (Database Schema)

```
Users (Người dùng)
├── id
├── email
├── password (hashed)
├── full_name
├── phone
├── role (customer/admin)
├── created_at
└── updated_at

Products (Sản phẩm)
├── id
├── name
├── description
├── price
├── discount_price
├── category_id
├── stock_quantity
├── images []
├── average_rating
├── total_reviews
├── created_at
└── updated_at

Categories (Danh mục)
├── id
├── name
├── parent_id (cho subcategory)
└── slug

Reviews (Đánh giá)
├── id
├── product_id
├── user_id
├── rating (1-5)
├── comment
├── images []
├── is_verified_purchase
├── created_at
└── updated_at

Orders (Đơn hàng)
├── id
├── user_id
├── total_amount
├── status (pending/processing/shipped/delivered/cancelled)
├── shipping_address
├── payment_method
├── created_at
└── updated_at

Order_Items (Chi tiết đơn hàng)
├── id
├── order_id
├── product_id
├── quantity
├── price
└── subtotal

Cart (Giỏ hàng)
├── id
├── user_id
├── product_id
├── quantity
└── added_at

User_Activity (Lịch sử hoạt động - cho Recommendation)
├── id
├── user_id
├── product_id
├── action_type (view/add_to_cart/purchase)
└── timestamp
```

### 6.2 ElasticSearch Index

```json
{
  "products": {
    "id": "string",
    "name": "text",
    "description": "text",
    "category": "keyword",
    "price": "float",
    "average_rating": "float",
    "total_reviews": "integer",
    "tags": ["keyword"],
    "in_stock": "boolean"
  }
}
```

---

## 7. CHỨC NĂNG CHI TIẾT

### 7.1 ElasticSearch Integration

**Tính năng:**
1. **Full-text search:** Tìm theo tên, mô tả sản phẩm
2. **Faceted search:** Filter theo category, giá, rating
3. **Auto-complete:** Gợi ý khi gõ
4. **Fuzzy search:** Chịu lỗi chính tả (vd: "iphone" → "iPhon")
5. **Search analytics:** Theo dõi từ khóa phổ biến

**Cách hoạt động:**
- Khi admin thêm/sửa sản phẩm → Tự động đồng bộ vào ES
- User search → Query ES → Trả về kết quả nhanh
- Highlight từ khóa trong kết quả

### 7.2 Review System

**Tính năng:**
1. Chỉ khách đã mua mới được review
2. Mỗi khách chỉ review 1 lần/sản phẩm
3. Upload tối đa 5 hình ảnh
4. Admin có thể ẩn review vi phạm
5. Tính rating trung bình tự động

**Validation:**
- Rating: 1-5 sao (bắt buộc)
- Comment: Tối thiểu 10 ký tự
- Hình ảnh: Max 5MB/ảnh

### 7.3 Recommendation System

**Thuật toán:**

1. **Collaborative Filtering (Lọc cộng tác)**
   - "Người mua A cũng mua B"
   - Dựa trên hành vi người dùng tương tự

2. **Content-Based (Dựa trên nội dung)**
   - Gợi ý sản phẩm cùng category
   - Gợi ý sản phẩm có tag tương tự

3. **Hybrid Approach**
   - Kết hợp cả 2 phương pháp trên
   - Weighted scoring

**Hiển thị:**
- "Sản phẩm tương tự"
- "Khách hàng cũng mua"
- "Dành riêng cho bạn" (personalized)
- "Trending" (sản phẩm hot)

---

## 8. TIMELINE DỰ KIẾN (16 tuần)

| Tuần | Công việc | Deliverable |
|------|-----------|-------------|
| 1-2 | Nghiên cứu, viết đề cương | Đề cương 3-5 trang |
| 3-4 | Chương 1: Giới thiệu | Chương 1 hoàn chỉnh |
| 5-6 | Chương 2: Literature Review | Chương 2 hoàn chỉnh |
| 7-8 | Thiết kế database, Use Case, ERD | Chương 3 (50%) |
| 9-10 | Thiết kế UI/UX, Wireframe | Chương 3 (100%) |
| 11-12 | Code Backend API + ElasticSearch | Code Backend |
| 13-14 | Code Frontend Web | Code Frontend |
| 15 | Testing, Bug fixing | Chương 4 |
| 16 | Hoàn thiện báo cáo, Chương 5 | Báo cáo hoàn chỉnh |

---

## 9. PHÂN TÍCH TÍNH KHẢ THI

### 9.1 Technical Feasibility (Kỹ thuật)
✅ **Khả thi**
- Công nghệ đã mature và có nhiều tài liệu
- ElasticSearch có documentation tốt
- Recommendation algorithms có sẵn libraries

### 9.2 Time Feasibility (Thời gian)
⚠️ **Cần lưu ý**
- 16 tuần là đủ nếu tập trung
- Nên giảm scope nếu làm cả Mobile App
- Recommendation có thể đơn giản hóa

### 9.3 Cost Feasibility (Chi phí)
✅ **Khả thi**
- Có thể dùng free tier: AWS, Heroku, Vercel
- ElasticSearch có thể chạy local hoặc dùng Elastic Cloud free trial
- Database: PostgreSQL free

### 9.4 Operational Feasibility (Vận hành)
✅ **Khả thi**
- Hệ thống đơn giản, dễ maintain
- Có thể deploy lên cloud
- Documentation đầy đủ

---

## 10. RỦI RO VÀ GIẢI PHÁP

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| ElasticSearch phức tạp | Cao | Học qua tutorial, dùng Elastic Cloud |
| Recommendation algorithm khó | Cao | Dùng thư viện có sẵn, đơn giản hóa |
| Thiếu thời gian | Trung bình | Ưu tiên core features, bỏ mobile app |
| Bug nhiều | Trung bình | Testing sớm, viết unit test |
| Thiếu data để test | Thấp | Tạo fake data bằng script |

---

## 11. ĐỀ XUẤT SCOPE

### 11.1 Must Have (Bắt buộc)
- ✅ Responsive Web Application (Customer + Admin)
- ✅ ElasticSearch tìm kiếm cơ bản + filter
- ✅ Review system đầy đủ (rating, comment, images)
- ✅ Recommendation đơn giản (content-based)
- ✅ E-commerce đầy đủ (cart, checkout, order management)
- ✅ User authentication & authorization

### 11.2 Should Have (Nên có)
- ⭐ ElasticSearch nâng cao (fuzzy search, autocomplete)
- ⭐ Recommendation nâng cao (collaborative filtering)
- ⭐ Admin analytics dashboard (charts, statistics)
- ⭐ Email notification (order confirmation)
- ⭐ Search analytics (popular keywords)

### 11.3 Nice to Have (Tốt nếu có)
- 💡 PWA (Progressive Web App) features
- 💡 Real-time order tracking
- 💡 Live chat support
- 💡 Social login (Google, Facebook)
- 💡 Wishlist feature
- 💡 Coupon/Discount system

---

## 12. KẾT LUẬN VÀ KHUYẾN NGHỊ

### ✅ Đề xuất cuối cùng:

**Loại hình:** Single Vendor E-commerce (như H&M, UniQlo)

**Lý do:**
1. Đơn giản hơn về quản lý
2. Dễ kiểm soát chất lượng sản phẩm
3. Phù hợp với thời gian 16 tuần
4. Tập trung làm Web App chất lượng cao
5. Responsive design → vẫn dùng được trên mobile browser

**Scope:**
- ✅ Responsive Web Application (Customer Portal + Admin Panel)
- ✅ ElasticSearch (tìm kiếm thông minh)
- ✅ Review System (đánh giá + hình ảnh)
- ✅ Recommendation System (gợi ý sản phẩm)
- ✅ Full E-commerce features

**Công nghệ:**
- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: PostgreSQL + ElasticSearch + Redis
- Deployment: Vercel (Frontend) + Railway/Render (Backend)

---

## 📋 BƯỚC TIẾP THEO

1. ✅ Xác nhận scope với giáo viên hướng dẫn
2. ✅ Viết đề cương chi tiết (3-5 trang)
3. ✅ Vẽ Use Case Diagram
4. ✅ Thiết kế ERD (Entity Relationship Diagram)
5. ✅ Tạo wireframe/mockup UI
6. ✅ Setup môi trường development
7. ✅ Bắt đầu code!

---

**Liên hệ nếu cần hỗ trợ thêm!** 🚀
