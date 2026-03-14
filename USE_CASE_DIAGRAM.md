# LƯỢC ĐỒ USE CASE - HỆ THỐNG E-COMMERCE

---

## 1. DANH SÁCH ACTORS (Người dùng)

| Actor | Mô tả |
|-------|-------|
| **Guest** | Khách vãng lai, chưa đăng nhập |
| **Customer** | Khách hàng đã đăng ký tài khoản |
| **Admin** | Quản trị viên hệ thống |

---

## 2. USE CASE DIAGRAM (Text Format)

```
╔═══════════════════════════════════════════════════════════════════╗
║           HỆ THỐNG E-COMMERCE WITH ELASTICSEARCH                  ║
║              REVIEW & RECOMMENDATION SYSTEM                        ║
╚═══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  👤 GUEST (Khách vãng lai)                                     │
│  │                                                              │
│  ├─► UC01: Xem danh sách sản phẩm                             │
│  ├─► UC02: Tìm kiếm sản phẩm (ElasticSearch)                  │
│  │    ├── Tìm kiếm theo từ khóa                               │
│  │    ├── Auto-complete                                        │
│  │    ├── Filter (category, giá, rating)                      │
│  │    └── Sắp xếp kết quả                                      │
│  ├─► UC03: Xem chi tiết sản phẩm                              │
│  ├─► UC04: Xem review sản phẩm                                │
│  │    ├── Xem rating trung bình                               │
│  │    ├── Xem tất cả review                                   │
│  │    └── Filter review theo số sao                           │
│  ├─► UC05: Xem sản phẩm gợi ý                                 │
│  │    ├── Sản phẩm tương tự                                   │
│  │    ├── Sản phẩm trending                                   │
│  │    └── Khách hàng cũng mua                                 │
│  ├─► UC06: Đăng ký tài khoản                                  │
│  └─► UC07: Đăng nhập                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 CUSTOMER (Khách hàng)                                      │
│  │  [Kế thừa tất cả chức năng của Guest]                      │
│  │                                                              │
│  ├─► UC08: Quản lý giỏ hàng                                   │
│  │    ├── Thêm sản phẩm vào giỏ                              │
│  │    ├── Xóa sản phẩm khỏi giỏ                              │
│  │    ├── Cập nhật số lượng                                   │
│  │    └── Xem tổng tiền                                       │
│  │                                                              │
│  ├─► UC09: Checkout & Đặt hàng                                │
│  │    ├── Chọn địa chỉ giao hàng                             │
│  │    ├── Chọn phương thức thanh toán                        │
│  │    └── Xác nhận đơn hàng                                   │
│  │                                                              │
│  ├─► UC10: Quản lý đơn hàng                                   │
│  │    ├── Xem lịch sử đơn hàng                               │
│  │    ├── Xem chi tiết đơn hàng                              │
│  │    ├── Theo dõi trạng thái                                 │
│  │    └── Hủy đơn hàng (nếu chưa xử lý)                      │
│  │                                                              │
│  ├─► UC11: Viết review sản phẩm                               │
│  │    ├── Đánh giá sao (1-5)                                 │
│  │    ├── Viết nhận xét                                       │
│  │    ├── Upload hình ảnh (tối đa 5)                         │
│  │    └── Chỉnh sửa/Xóa review của mình                      │
│  │                                                              │
│  ├─► UC12: Quản lý tài khoản                                  │
│  │    ├── Xem thông tin cá nhân                              │
│  │    ├── Cập nhật thông tin                                  │
│  │    ├── Đổi mật khẩu                                        │
│  │    └── Quản lý địa chỉ giao hàng                          │
│  │                                                              │
│  ├─► UC13: Xem gợi ý cá nhân hóa                             │
│  │    ├── Dựa trên lịch sử xem                               │
│  │    ├── Dựa trên lịch sử mua                               │
│  │    └── "Dành riêng cho bạn"                               │
│  │                                                              │
│  └─► UC14: Đăng xuất                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 ADMIN (Quản trị viên)                                      │
│  │                                                              │
│  ├─► UC15: Đăng nhập Admin                                    │
│  │                                                              │
│  ├─► UC16: Quản lý sản phẩm                                   │
│  │    ├── Thêm sản phẩm mới                                   │
│  │    ├── Sửa thông tin sản phẩm                             │
│  │    ├── Xóa sản phẩm                                        │
│  │    ├── Upload/Quản lý hình ảnh                            │
│  │    ├── Quản lý tồn kho                                     │
│  │    └── Đồng bộ với ElasticSearch                          │
│  │                                                              │
│  ├─► UC17: Quản lý danh mục                                   │
│  │    ├── Thêm danh mục                                       │
│  │    ├── Sửa danh mục                                        │
│  │    ├── Xóa danh mục                                        │
│  │    └── Quản lý danh mục con                               │
│  │                                                              │
│  ├─► UC18: Quản lý đơn hàng                                   │
│  │    ├── Xem danh sách đơn hàng                             │
│  │    ├── Xem chi tiết đơn hàng                              │
│  │    ├── Cập nhật trạng thái đơn hàng                       │
│  │    │    ├── Pending → Processing                           │
│  │    │    ├── Processing → Shipped                           │
│  │    │    ├── Shipped → Delivered                            │
│  │    │    └── Cancelled                                      │
│  │    └── Xử lý hoàn trả                                      │
│  │                                                              │
│  ├─► UC19: Quản lý khách hàng                                 │
│  │    ├── Xem danh sách khách hàng                           │
│  │    ├── Xem thông tin chi tiết                             │
│  │    ├── Xem lịch sử mua hàng                               │
│  │    └── Khóa/Mở khóa tài khoản                             │
│  │                                                              │
│  ├─► UC20: Quản lý review                                     │
│  │    ├── Xem tất cả review                                   │
│  │    ├── Duyệt review                                        │
│  │    ├── Ẩn review vi phạm                                   │
│  │    └── Xóa review spam                                     │
│  │                                                              │
│  ├─► UC21: Xem báo cáo & Thống kê                            │
│  │    ├── Dashboard tổng quan                                 │
│  │    ├── Báo cáo doanh thu                                   │
│  │    ├── Sản phẩm bán chạy                                  │
│  │    ├── Từ khóa tìm kiếm phổ biến                          │
│  │    ├── Thống kê review                                     │
│  │    └── Biểu đồ theo thời gian                             │
│  │                                                              │
│  └─► UC22: Cấu hình hệ thống                                  │
│       ├── Cài đặt chung                                        │
│       ├── Quản lý ElasticSearch index                         │
│       └── Backup dữ liệu                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CHI TIẾT USE CASE CHÍNH

### UC02: Tìm kiếm sản phẩm (ElasticSearch)

**Actor:** Guest, Customer

**Mô tả:** Người dùng tìm kiếm sản phẩm bằng từ khóa với sự hỗ trợ của ElasticSearch

**Tiền điều kiện:** Không có

**Luồng chính:**
1. Người dùng nhập từ khóa vào ô tìm kiếm
2. Hệ thống hiển thị gợi ý auto-complete
3. Người dùng nhấn Enter hoặc chọn gợi ý
4. Hệ thống query ElasticSearch
5. Hệ thống hiển thị kết quả tìm kiếm
6. Người dùng có thể:
   - Filter theo category, giá, rating
   - Sắp xếp theo relevance, giá, rating
7. Hệ thống cập nhật kết quả theo filter

**Luồng thay thế:**
- 4a. Không tìm thấy kết quả → Hiển thị "Không tìm thấy sản phẩm"
- 4b. Từ khóa sai chính tả → ElasticSearch tự động sửa (fuzzy search)

**Hậu điều kiện:** Hiển thị danh sách sản phẩm phù hợp

---

### UC11: Viết review sản phẩm

**Actor:** Customer

**Mô tả:** Khách hàng đánh giá sản phẩm đã mua

**Tiền điều kiện:** 
- Đã đăng nhập
- Đã mua sản phẩm này
- Chưa review sản phẩm này

**Luồng chính:**
1. Khách hàng vào trang chi tiết sản phẩm đã mua
2. Nhấn nút "Viết đánh giá"
3. Chọn số sao (1-5)
4. Viết nhận xét (tối thiểu 10 ký tự)
5. Upload hình ảnh (tùy chọn, tối đa 5 ảnh)
6. Nhấn "Gửi đánh giá"
7. Hệ thống validate dữ liệu
8. Lưu review vào database
9. Cập nhật rating trung bình của sản phẩm
10. Đồng bộ rating mới vào ElasticSearch
11. Hiển thị thông báo thành công

**Luồng thay thế:**
- 7a. Nhận xét quá ngắn → Hiển thị lỗi
- 7b. Hình ảnh quá lớn (>5MB) → Hiển thị lỗi
- 7c. Upload quá 5 ảnh → Hiển thị lỗi

**Hậu điều kiện:** Review được lưu và hiển thị trên trang sản phẩm

---

### UC13: Xem gợi ý cá nhân hóa

**Actor:** Customer

**Mô tả:** Hệ thống gợi ý sản phẩm phù hợp dựa trên hành vi người dùng

**Tiền điều kiện:** Đã đăng nhập

**Luồng chính:**
1. Khách hàng truy cập trang chủ hoặc trang sản phẩm
2. Hệ thống lấy lịch sử hoạt động của khách hàng:
   - Sản phẩm đã xem
   - Sản phẩm đã mua
   - Sản phẩm trong giỏ hàng
3. Recommendation engine phân tích:
   - Content-based: Sản phẩm cùng category/tag
   - Collaborative filtering: Người dùng tương tự đã mua gì
4. Hệ thống tính điểm và sắp xếp sản phẩm gợi ý
5. Hiển thị các section:
   - "Dành riêng cho bạn"
   - "Sản phẩm tương tự"
   - "Khách hàng cũng mua"
6. Khách hàng click vào sản phẩm gợi ý
7. Hệ thống lưu lại hành động này để cải thiện gợi ý sau

**Luồng thay thế:**
- 2a. Khách hàng mới, chưa có lịch sử → Hiển thị sản phẩm trending

**Hậu điều kiện:** Hiển thị danh sách sản phẩm gợi ý phù hợp

---

### UC16: Quản lý sản phẩm (Admin)

**Actor:** Admin

**Mô tả:** Admin thêm/sửa/xóa sản phẩm và tự động đồng bộ với ElasticSearch

**Tiền điều kiện:** Đã đăng nhập với quyền Admin

**Luồng chính (Thêm sản phẩm):**
1. Admin vào trang "Quản lý sản phẩm"
2. Nhấn "Thêm sản phẩm mới"
3. Nhập thông tin:
   - Tên sản phẩm
   - Mô tả
   - Giá
   - Giá khuyến mãi (nếu có)
   - Danh mục
   - Số lượng tồn kho
   - Tags
4. Upload hình ảnh sản phẩm (tối thiểu 1, tối đa 10)
5. Nhấn "Lưu"
6. Hệ thống validate dữ liệu
7. Upload hình ảnh lên Cloudinary
8. Lưu thông tin sản phẩm vào PostgreSQL
9. Tự động đồng bộ sản phẩm vào ElasticSearch index
10. Hiển thị thông báo thành công

**Luồng thay thế:**
- 6a. Thiếu thông tin bắt buộc → Hiển thị lỗi
- 7a. Upload hình ảnh thất bại → Hiển thị lỗi, rollback
- 9a. Đồng bộ ElasticSearch thất bại → Log lỗi, thử lại sau

**Hậu điều kiện:** Sản phẩm mới được thêm vào cả PostgreSQL và ElasticSearch

---

## 4. QUAN HỆ GIỮA CÁC USE CASE

### Include Relationships (Bao gồm)
```
UC02 (Tìm kiếm) <<include>> UC01 (Xem danh sách)
UC09 (Checkout) <<include>> UC08 (Quản lý giỏ hàng)
UC11 (Viết review) <<include>> UC07 (Đăng nhập)
UC16 (Quản lý sản phẩm) <<include>> UC15 (Đăng nhập Admin)
```

### Extend Relationships (Mở rộng)
```
UC02 (Tìm kiếm) <<extend>> UC05 (Xem gợi ý) - Nếu không tìm thấy
UC03 (Chi tiết SP) <<extend>> UC05 (Xem gợi ý) - Hiển thị SP tương tự
UC11 (Viết review) <<extend>> UC10 (Quản lý đơn hàng) - Từ lịch sử đơn
```

### Generalization (Kế thừa)
```
Customer kế thừa tất cả chức năng của Guest
+ Thêm các chức năng yêu cầu đăng nhập
```

---

## 5. MA TRẬN ACTOR - USE CASE

| Use Case | Guest | Customer | Admin |
|----------|-------|----------|-------|
| UC01: Xem danh sách sản phẩm | ✓ | ✓ | ✓ |
| UC02: Tìm kiếm sản phẩm | ✓ | ✓ | ✓ |
| UC03: Xem chi tiết sản phẩm | ✓ | ✓ | ✓ |
| UC04: Xem review | ✓ | ✓ | ✓ |
| UC05: Xem gợi ý | ✓ | ✓ | ✓ |
| UC06: Đăng ký | ✓ | - | - |
| UC07: Đăng nhập | ✓ | - | - |
| UC08: Quản lý giỏ hàng | - | ✓ | - |
| UC09: Checkout | - | ✓ | - |
| UC10: Quản lý đơn hàng | - | ✓ | - |
| UC11: Viết review | - | ✓ | - |
| UC12: Quản lý tài khoản | - | ✓ | - |
| UC13: Gợi ý cá nhân hóa | - | ✓ | - |
| UC14: Đăng xuất | - | ✓ | ✓ |
| UC15: Đăng nhập Admin | - | - | ✓ |
| UC16: Quản lý sản phẩm | - | - | ✓ |
| UC17: Quản lý danh mục | - | - | ✓ |
| UC18: Quản lý đơn hàng | - | - | ✓ |
| UC19: Quản lý khách hàng | - | - | ✓ |
| UC20: Quản lý review | - | - | ✓ |
| UC21: Báo cáo & Thống kê | - | - | ✓ |
| UC22: Cấu hình hệ thống | - | - | ✓ |

---

## 6. ƯU TIÊN TRIỂN KHAI

### Phase 1 - Core Features (Tuần 11-12)
- UC01, UC02, UC03: Xem và tìm kiếm sản phẩm
- UC06, UC07: Đăng ký, đăng nhập
- UC16, UC17: Quản lý sản phẩm, danh mục (Admin)

### Phase 2 - E-commerce (Tuần 13)
- UC08, UC09: Giỏ hàng, Checkout
- UC10: Quản lý đơn hàng (Customer)
- UC18: Quản lý đơn hàng (Admin)

### Phase 3 - Review & Recommendation (Tuần 14)
- UC04, UC11: Xem và viết review
- UC05, UC13: Gợi ý sản phẩm
- UC20: Quản lý review (Admin)

### Phase 4 - Advanced Features (Tuần 15)
- UC12, UC19: Quản lý tài khoản, khách hàng
- UC21: Báo cáo & Thống kê
- UC22: Cấu hình hệ thống

---

**Ghi chú:** 
- Sơ đồ Use Case chi tiết (dạng hình ảnh) có thể vẽ bằng các công cụ:
  - Draw.io / Diagrams.net
  - Lucidchart
  - PlantUML
  - Visual Paradigm
  - StarUML

---

**Ngày lập:** [Ngày/Tháng/Năm]

**Sinh viên thực hiện:** [Họ và tên]
