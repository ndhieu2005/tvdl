# User Deletion with CASCADE Constraints

## Tổng quan

Hệ thống đã được cập nhật để xử lý việc xóa user một cách an toàn với các ràng buộc CASCADE và xử lý các field reference.

## Các thay đổi đã thực hiện

### 1. Database Schema Updates

**Đã thêm ON DELETE CASCADE cho:**
- `posts.authorId → users.id`
- `media_files.uploadedBy → users.id`
- `session_tokens.userId → users.id` (đã có sẵn)
- `api_keys.userId → users.id` (đã có sẵn)

**Các field String reference được xử lý trong application logic:**
- `posts.createdBy`
- `tags.createdBy`
- `security_settings.updatedBy`
- `settings.updatedBy`
- `card_registrations.updatedBy`
- `room_bookings.updatedBy`
- `books.createdBy`, `books.updatedBy`
- `events.createdBy`, `events.updatedBy`

### 2. API Endpoint Updates

**File:** `/src/app/api/users/[id]/route.ts`

DELETE endpoint đã được cập nhật để:
- Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
- Cập nhật tất cả các field reference trước khi xóa user
- Thay thế bằng admin user hoặc 'system' cho các field bắt buộc
- Set null cho các field nullable

### 3. Scripts

**`safe-delete-user.js`** - Script command line để xóa user an toàn:
```bash
node scripts/safe-delete-user.js <userId>
```

**`test-delete-user.js`** - Script test để kiểm tra tính đúng đắn:
```bash
node scripts/test-delete-user.js
```

## Cách sử dụng

### 1. Xóa user qua API

```javascript
// DELETE /api/users/{userId}
const response = await fetch('/api/users/user123', {
  method: 'DELETE'
});
```

### 2. Xóa user qua command line

```bash
cd /path/to/project
node scripts/safe-delete-user.js user123
```

### 3. Test hệ thống

```bash
node scripts/test-delete-user.js
```

## Luồng xử lý khi xóa user

1. **Kiểm tra user tồn tại**
2. **Kiểm tra không phải admin cuối cùng**
3. **Tìm admin user để thay thế**
4. **Cập nhật các field reference:**
   - `tags.createdBy` → admin user hoặc 'system'
   - `posts.createdBy` → admin user hoặc 'system'
   - `security_settings.updatedBy` → admin user hoặc 'system'
   - `settings.updatedBy` → admin user hoặc 'system'
   - `card_registrations.updatedBy` → null
   - `room_bookings.updatedBy` → null
   - `books.createdBy` → admin user hoặc 'system'
   - `books.updatedBy` → null
   - `events.createdBy` → admin user hoặc 'system'
   - `events.updatedBy` → null
5. **Xóa user** (CASCADE sẽ tự động xóa posts, media, sessions, api keys)

## Lưu ý quan trọng

- ⚠️ **Không thể xóa admin cuối cùng** - Hệ thống sẽ từ chối
- 🔒 **Sử dụng transaction** - Đảm bảo tính toàn vẹn dữ liệu
- 📝 **Audit trail được bảo toàn** - Các record khác vẫn giữ thông tin về ai tạo/cập nhật
- 🔄 **Rollback tự động** - Nếu có lỗi, tất cả thay đổi sẽ được rollback

## Troubleshooting

### Lỗi "Foreign key constraint fails"

Nếu vẫn gặp lỗi này, có thể:
1. Chạy lại migration: `npx prisma db push`
2. Kiểm tra database constraints: `SHOW CREATE TABLE posts;`
3. Chạy test script để xác định vấn đề: `node scripts/test-delete-user.js`

### Lỗi "Cannot delete admin user"

- Đảm bảo có ít nhất 2 admin users trong hệ thống
- Hoặc thay đổi role của user khác thành ADMIN trước khi xóa

### Performance

Với database lớn, việc cập nhật nhiều records có thể mất thời gian. Có thể:
- Thêm index cho các field `createdBy`, `updatedBy`
- Chạy trong background job cho user có nhiều data
- Sử dụng batch processing cho các bảng lớn