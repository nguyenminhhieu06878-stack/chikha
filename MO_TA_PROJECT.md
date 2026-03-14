# MÔ TẢ PROJECT - ĐỒ ÁN TỐT NGHIỆP

---

## 1. THÔNG TIN CHUNG

**Tên đề tài:** Hệ thống E-commerce tích hợp ElasticSearch, Review và Recommendation System

**Tên tiếng Anh:** E-commerce System with ElasticSearch, Review and Recommendation Features

**Sinh viên thực hiện:** [Tên sinh viên]

**Mã số sinh viên:** [Mã SV]

**Giáo viên hướng dẫn:** [Tên GVHD]

**Thời gian thực hiện:** 16 tuần (Tháng [X] - Tháng [Y], 2025)

---

## 2. TỔNG QUAN DỰ ÁN

### 2.1 Giới thiệu

Trong bối cảnh thương mại điện tử phát triển mạnh mẽ, việc cung cấp trải nghiệm mua sắm tốt cho khách hàng là yếu tố then chốt để thành công. Ba yếu tố quan trọng nhất là:

1. **Tìm kiếm nhanh và chính xác** - Khách hàng cần tìm được sản phẩm mong muốn một cách dễ dàng
2. **Đánh giá sản phẩm đáng tin cậy** - Khách hàng cần thông tin từ người dùng thực tế
3. **Gợi ý sản phẩm phù hợp** - Giúp khách hàng khám phá sản phẩm mới

Dự án này xây dựng một hệ thống E-commerce hoàn chỉnh tích hợp ba tính năng trên, sử dụng công nghệ ElasticSearch cho tìm kiếm thông minh, hệ thống Review cho đánh giá sản phẩm, và thuật toán Recommendation để gợi ý sản phẩm cá nhân hóa.

### 2.2 Mục tiêu

**Mục tiêu chính:**
- Xây dựng hệ thống E-commerce đầy đủ chức năng với trải nghiệm người dùng tốt
- Tích hợp ElasticSearch để cung cấp tìm kiếm nhanh, chính xác và thông minh
- Phát triển hệ thống Review cho phép khách hàng đánh giá và chia sẻ trải nghiệm
- Áp dụng thuật toán Recommendation để gợi ý sản phẩm phù hợp

**Mục tiêu cụ thể:**
1. Nghiên cứu và áp dụng ElasticSearch vào hệ thống tìm kiếm sản phẩm
2. Thiết kế và triển khai hệ thống đánh giá sản phẩm với rating và comment
3. Xây dựng thuật toán gợi ý sản phẩm dựa trên hành vi người dùng
4. Phát triển giao diện web responsive, thân thiện với người dùng
5. Xây dựng Admin Panel để quản lý hệ thống hiệu quả

### 2.3 Phạm vi dự án

**Trong phạm vi:**
- Hệ thống E-commerce cho mô hình Single Vendor (một người bán)
- Web Application với Responsive Design (Desktop, Tablet, Mobile)
- Tích hợp ElasticSearch cho tìm kiếm và filter sản phẩm
- Hệ thống Review đầy đủ (rating, comment, upload hình ảnh)
- Recommendation System (Content-based và Collaborative Filtering)
- Quản lý sản phẩm, đơn hàng, khách hàng
- Giỏ hàng và thanh toán cơ bản
- Admin Dashboard với thống kê

**Ngoài phạm vi:**
- Mobile Application (iOS/Android native)
- Thanh toán trực tuyến thật (chỉ demo)
- Tích hợp vận chuyển thực tế
- Multi-vendor marketplace
- Chat/Messaging real-time

### 2.4 Đối tượng sử dụng

1. **Khách hàng (Customer):**
   - Tìm kiếm và mua sản phẩm
   - Đánh giá và review sản phẩm
   - Xem gợi ý sản phẩm phù hợp

2. **Quản trị viên (Admin):**
   - Quản lý sản phẩm, danh mục
   - Quản lý đơn hàng
   - Quản lý khách hàng và review
   - Xem báo cáo thống kê

---

## 3. TÍNH NĂNG CHI TIẾT

### 3.1 Chức năng cho Khách hàng

#### A. Tìm kiếm sản phẩm (ElasticSearch)
- Tìm kiếm full-text theo tên, mô tả sản phẩm
- Auto-complete/Auto-suggest khi gõ từ khóa
- Fuzzy search (chịu lỗi chính tả)
- Filter nâng cao:
  - Theo danh mục
  - Theo khoảng giá
  - Theo rating
  - Theo tình trạng còn hàng
- Sắp xếp kết quả:
  - Độ liên quan (relevance)
  - Giá (thấp → cao, cao → thấp)
  - Rating (cao → thấp)
  - Mới nhất

#### B. Xem và đánh giá sản phẩm
- Xem chi tiết sản phẩm (hình ảnh, mô tả, giá, rating)
- Xem tất cả review của sản phẩm
- Filter review theo số sao
- Đánh giá sản phẩm (chỉ sau khi mua):
  - Rating 1-5 sao
  - Viết comment (tối thiểu 10 ký tự)
  - Upload tối đa 5 hình ảnh
- Xem rating trung bình và tổng số review

#### C. Gợi ý sản phẩm (Recommendation)
- "Sản phẩm tương tự" (cùng category, tag)
- "Khách hàng cũng mua" (collaborative filtering)
- "Dành riêng cho bạn" (personalized recommendations)
- "Sản phẩm đang hot" (trending products)

#### D. Mua sắm
- Thêm sản phẩm vào giỏ hàng
- Xem và chỉnh sửa giỏ hàng
- Checkout và đặt hàng
- Chọn địa chỉ giao hàng
- Chọn phương thức thanh toán
- Xem lịch sử đơn hàng
- Theo dõi trạng thái đơn hàng

#### E. Quản lý tài khoản
- Đăng ký/Đăng nhập
- Cập nhật thông tin cá nhân
- Quản lý địa chỉ giao hàng
- Đổi mật khẩu

### 3.2 Chức năng cho Admin

#### A. Quản lý sản phẩm
- Thêm sản phẩm mới
- Sửa thông tin sản phẩm
- Xóa sản phẩm
- Upload/Quản lý hình ảnh sản phẩm
- Quản lý tồn kho
- Đồng bộ tự động với ElasticSearch

#### B. Quản lý danh mục
- Thêm/Sửa/Xóa danh mục
- Quản lý danh mục con (subcategory)

#### C. Quản lý đơn hàng
- Xem danh sách đơn hàng
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng:
  - Pending (Chờ xử lý)
  - Processing (Đang xử lý)
  - Shipped (Đã gửi hàng)
  - Delivered (Đã giao)
  - Cancelled (Đã hủy)
- Xử lý hoàn trả/hủy đơn

#### D. Quản lý khách hàng
- Xem danh sách khách hàng
- Xem thông tin chi tiết khách hàng
- Xem lịch sử mua hàng của khách

#### E. Quản lý Review
- Xem tất cả review
- Duyệt/Ẩn review vi phạm
- Xóa review spam

#### F. Thống kê và báo cáo
- Dashboard tổng quan:
  - Tổng doanh thu
  - Số đơn hàng
  - Số khách hàng mới
  - Sản phẩm bán chạy
- Biểu đồ doanh thu theo thời gian
- Top sản phẩm bán chạy
- Top từ khóa tìm kiếm phổ biến
- Thống kê review (rating trung bình, số lượng)

---

## 4. CÔNG NGHỆ SỬ DỤNG

### 4.1 Frontend
- **Framework:** React.js 18+
- **UI Library:** Tailwind CSS / Material-UI
- **State Management:** Redux Toolkit / Context API
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Form Handling:** React Hook Form
- **Charts:** Recharts / Chart.js (cho admin dashboard)

### 4.2 Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcrypt
- **File Upload:** Multer
- **Validation:** Joi / Express Validator

### 4.3 Database
- **Primary Database:** PostgreSQL 15+
  - Lưu trữ dữ liệu chính (users, products, orders, reviews)
- **Search Engine:** ElasticSearch 8+
  - Index và tìm kiếm sản phẩm
- **Cache:** Redis
  - Session management
  - Cache dữ liệu thường xuyên truy cập

### 4.4 Storage
- **Image Storage:** Cloudinary / AWS S3
  - Lưu trữ hình ảnh sản phẩm và review

### 4.5 Deployment (Môi trường phát triển)
- **Development:** Chạy local trên máy tính
- **Frontend:** localhost:3000 (React Dev Server)
- **Backend:** localhost:5000 (Node.js Express)
- **Database:** PostgreSQL local / Docker
- **ElasticSearch:** Local / Docker container
- **Redis:** Local / Docker container

**Lưu ý:** Đây là đồ án sinh viên, hệ thống sẽ chạy trên môi trường local để demo và bảo vệ. Không yêu cầu deploy lên production.

### 4.6 Tools & Others
- **Version Control:** Git + GitHub
- **API Testing:** Postman
- **Code Editor:** VS Code
- **Package Manager:** npm / yarn

---

## 5. KIẾN TRÚC HỆ THỐNG

### 5.1 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                   React.js + Tailwind                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API GATEWAY / BACKEND                   │
│                  Node.js + Express.js                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Authentication │ Authorization │ Business Logic │  │
│  └──────────────────────────────────────────────────┘  │
└─────┬──────────────┬──────────────┬────────────────────┘
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌─────────┐
│PostgreSQL│  │ElasticSearch │  │  Redis  │
│ (Primary)│  │   (Search)   │  │ (Cache) │
└──────────┘  └──────────────┘  └─────────┘
      │
      ▼
┌──────────────┐
│  Cloudinary  │
│   (Images)   │
└──────────────┘
```

### 5.2 Luồng dữ liệu chính

**1. Tìm kiếm sản phẩm:**
```
User nhập từ khóa → Frontend gửi request → Backend query ElasticSearch 
→ ElasticSearch trả kết quả → Backend format → Frontend hiển thị
```

**2. Thêm sản phẩm (Admin):**
```
Admin nhập thông tin → Upload ảnh lên Cloudinary → Lưu vào PostgreSQL 
→ Tự động đồng bộ vào ElasticSearch → Thành công
```

**3. Đánh giá sản phẩm:**
```
User viết review → Upload ảnh (nếu có) → Lưu vào PostgreSQL 
→ Tính lại rating trung bình → Cập nhật ElasticSearch → Thành công
```

**4. Gợi ý sản phẩm:**
```
User xem sản phẩm → Lưu activity vào DB → Recommendation engine phân tích 
→ Trả về danh sách gợi ý → Frontend hiển thị
```

---

## 6. LỊCH TRÌNH THỰC HIỆN

| Tuần | Nội dung công việc | Kết quả mong đợi |
|------|-------------------|------------------|
| 1-2 | - Nghiên cứu tài liệu<br>- Viết đề cương<br>- Thiết kế Use Case | Đề cương hoàn chỉnh |
| 3-4 | - Viết Chương 1<br>- Nghiên cứu ElasticSearch | Chương 1 hoàn chỉnh |
| 5-6 | - Viết Chương 2<br>- Nghiên cứu Recommendation algorithms | Chương 2 hoàn chỉnh |
| 7-8 | - Thiết kế Database (ERD)<br>- Thiết kế API<br>- Thiết kế UI/UX | Chương 3 (50%) |
| 9-10 | - Hoàn thiện Chương 3<br>- Setup môi trường dev | Chương 3 hoàn chỉnh |
| 11-12 | - Code Backend API<br>- Tích hợp ElasticSearch<br>- Tích hợp PostgreSQL | Backend hoàn chỉnh |
| 13-14 | - Code Frontend<br>- Tích hợp API<br>- Implement Recommendation | Frontend hoàn chỉnh |
| 15 | - Testing<br>- Bug fixing<br>- Viết Chương 4 | Chương 4 hoàn chỉnh |
| 16 | - Hoàn thiện báo cáo<br>- Viết Chương 5<br>- Chuẩn bị demo | Báo cáo hoàn chỉnh |

---

## 7. KẾT QUẢ MONG ĐỢI

### 7.1 Sản phẩm
- Hệ thống E-commerce hoàn chỉnh, hoạt động ổn định
- Giao diện web responsive, thân thiện người dùng
- Tìm kiếm nhanh và chính xác với ElasticSearch
- Hệ thống review đầy đủ chức năng
- Recommendation system hoạt động hiệu quả

### 7.2 Báo cáo
- Báo cáo đồ án 50-80 trang
- Tài liệu kỹ thuật đầy đủ
- Source code có comment rõ ràng
- Hướng dẫn cài đặt và sử dụng

### 7.3 Kiến thức đạt được
- Hiểu sâu về kiến trúc hệ thống E-commerce
- Thành thạo ElasticSearch
- Nắm vững thuật toán Recommendation
- Kỹ năng phát triển Full-stack Web Application
- Kỹ năng quản lý dự án và làm việc độc lập

---

## 8. TÍNH KHẢ THI

### 8.1 Kỹ thuật
✅ **Khả thi cao**
- Công nghệ đã mature, có nhiều tài liệu
- ElasticSearch có documentation chi tiết
- Recommendation algorithms có sẵn thư viện
- Có thể tham khảo nhiều dự án mã nguồn mở

### 8.2 Thời gian
✅ **Khả thi**
- 16 tuần là đủ nếu làm việc đều đặn
- Có thể điều chỉnh scope nếu cần
- Ưu tiên core features trước

### 8.3 Chi phí
✅ **Khả thi**
- Sử dụng free tier của các dịch vụ cloud
- ElasticSearch có thể chạy local hoặc dùng free trial
- Không phát sinh chi phí lớn

---

## 9. RỦI RO VÀ GIẢI PHÁP

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| ElasticSearch phức tạp | Cao | Học qua tutorial, sử dụng Elastic Cloud |
| Recommendation algorithm khó | Cao | Dùng thư viện có sẵn, bắt đầu với content-based đơn giản |
| Thiếu thời gian | Trung bình | Ưu tiên core features, làm việc theo kế hoạch |
| Bug nhiều khi tích hợp | Trung bình | Testing sớm, viết unit test |
| Thiếu data để test | Thấp | Tạo fake data bằng script/seeder |

---

**Ngày lập:** [Ngày/Tháng/Năm]

**Sinh viên thực hiện**

[Chữ ký]

[Họ và tên]
