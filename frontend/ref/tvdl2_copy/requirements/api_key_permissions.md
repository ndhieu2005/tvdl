# Tính Năng API Key và Quyền Người Dùng

## 🔐 1. API Key

API key cho phép người dùng sử dụng API của hệ thống thông qua một mã xác thực riêng biệt.

### Mục tiêu:
- Xác thực người dùng gọi API.
- Cấu hình chi tiết quyền truy cập theo key.
- Cho phép thu hồi, giới hạn hoặc gia hạn key.

### Cấu trúc cơ bản:
- `id`: định danh key
- `userId`: người sở hữu key
- `key`: mã API (mã hoá SHA256 khi lưu)
- `permissions[]`: danh sách quyền được cấp
- `status`: active / revoked / expired
- `createdAt`, `expiresAt`: thời gian hiệu lực

---

## ⚙️ 2. Các Quyền Cấu Hình Theo API Key

### 📝 Bài Viết (Posts)
| Hành động | Mã quyền       | Mô tả                             |
|----------|----------------|----------------------------------|
| Xem      | `post:read`    | Xem danh sách, chi tiết bài viết |
| Tạo      | `post:create`  | Tạo bài viết mới                 |
| Sửa      | `post:update`  | Cập nhật bài viết                |
| Xoá      | `post:delete`  | Xoá bài viết                     |

### 📁 Tệp Tin (Files - Videos, Images...)
| Hành động | Mã quyền       | Mô tả                              |
|----------|----------------|-----------------------------------|
| Xem      | `file:read`    | Tải hoặc duyệt danh sách file     |
| Tải lên  | `file:upload`  | Upload video, ảnh, tài liệu       |
| Sửa      | `file:update`  | Đổi tên, cập nhật metadata        |
| Xoá      | `file:delete`  | Xoá file đã upload                |

---

## 🧪 3. API Mẫu

### Ví dụ gọi API:
```http
GET /api/posts
Authorization: Bearer <API_KEY>
```

Hệ thống sẽ kiểm tra:
- Tính hợp lệ của API key
- Có quyền `post:read` hay không

---

## 💾 4. Cấu Trúc Cơ Sở Dữ Liệu (Gợi ý)
### Bảng `api_keys`
```ts
id: string
user_id: string
key: string // (SHA256 hash)
permissions: string[] // ['post:create', 'file:upload']
status: 'active' | 'revoked' | 'expired'
created_at: Date
expires_at: Date
```

---

## 🧩 5. Mở Rộng
- Tích hợp giới hạn request (rate limit)
- Cho phép chỉnh sửa quyền sau khi tạo key
- Xem log sử dụng theo từng key
- Tạo UI để người dùng tự tạo và quản lý key