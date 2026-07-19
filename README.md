# Thư viện Dương Liễu — TVDL 3.0

Website portal thông tin cho thư viện cộng đồng (~2.000 lượt/tháng). **Chỉ là trang thông tin** — không có nghiệp vụ mượn/trả sách (Skoolib xử lý riêng). Người dùng đến để: xem lịch hoạt động, tra cứu sách, xem sách mới nhập.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 19, Vite 8, TailwindCSS v4, React Router v7, Axios |
| Backend | Node.js, Express, Prisma ORM, MySQL |
| Deploy | VPS Ubuntu 22.04 — IP `103.166.182.105`, SSH port `24700` |
| CI/CD | GitLab pipeline — push `main` → auto deploy |

---

## Cấu trúc thư mục

```
/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── public/          # GET routes, không cần auth
│   │   │   │   ├── books.js     # cursor-based pagination
│   │   │   │   ├── newBooks.js  # cursor-based pagination
│   │   │   │   ├── schedules.js # filter theo month/year
│   │   │   │   ├── ageGroups.js
│   │   │   │   ├── events.js
│   │   │   │   └── suggestions.js  # POST (gửi đề xuất sách)
│   │   │   └── admin/           # JWT required
│   │   │       ├── auth.js      # POST /login
│   │   │       ├── scheduleTemplates.js  # CRUD lịch chuẩn tuần
│   │   │       ├── newBooks.js  # CRUD
│   │   │       ├── schedules.js # CRUD
│   │   │       └── suggestions.js  # GET (xem danh sách)
│   │   ├── middleware/auth.js   # JWT verify
│   │   └── utils/
│   ├── prisma/schema.prisma
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── lib/api.js           # axios instances: `api` (public) và `adminApi` (JWT)
    │   ├── App.jsx              # routing
    │   ├── index.css            # @theme tokens (màu, font, size)
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Navbar.jsx       # sticky top, có social icons
    │   │       ├── PublicLayout.jsx # Navbar + <Outlet />
    │   │       └── AdminLayout.jsx
    │   └── pages/
    │       ├── public/
    │       │   ├── HubPage.jsx      # "/" — hero + tile grid + search bar
    │       │   ├── SchedulePage.jsx # "/schedule" — calendar + sidebar
    │       │   ├── BooksPage.jsx    # "/search" — search + filter + grid
    │       │   ├── NewBooksPage.jsx # "/new-books" — list sách mới
    │       │   ├── AboutPage.jsx    # "/about"
    │       │   └── ServicesPage.jsx # "/services"
    │       └── admin/
    │           ├── LoginPage.jsx
    │           ├── AdminNewBooksPage.jsx # CRUD sách mới
    │           ├── AdminSchedulesPage.jsx # CRUD lịch
    │           └── SuggestionsPage.jsx   # xem đề xuất sách
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Khởi động local

```bash
# Terminal 1 — Backend
cd backend
npm install
npx prisma migrate dev
npm run dev          # chạy port 3000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev          # chạy port 5173, proxy /api → localhost:3000
```

> Vite đã cấu hình proxy `/api → http://localhost:3000` trong `vite.config.js`. Không cần thêm gì.

---

## Design System

**Font:** Be Vietnam Pro (Google Fonts — đã import trong `index.css`)

**Color tokens** (định nghĩa trong `frontend/src/index.css` → `@theme`):

| Token | Hex | Dùng ở đâu |
|---|---|---|
| `blue` | `#1B3F8B` | Heading, logo, nav, border, nền button xanh |
| `blue-light` | `#2550b0` | Hover state của `bg-blue` |
| `yellow` | `#F5C000` | Accent, nav active, CHỦ NHẬT, dấu `!` |
| `dark` | `#2D2D2D` | Search bar nền, social nav |
| `cream` | `#F2EAD3` | Calendar cells, placeholder image bg |
| `muted` | `#9CA3AF` | Caption, placeholder text |

**Font size tokens:**

| Token | Size | Dùng ở đâu |
|---|---|---|
| `text-hero` | 6rem | "Chào mừng bạn!" — HubPage |
| `text-page` | 2.5rem | Page headings |
| `text-section` | 1.5rem | Section headings |
| `text-nav` | 0.8125rem | Navbar items |

**Nguyên tắc:**
- Flat design — **không** shadow, không gradient
- Chỉ 2 màu chủ (xanh + vàng), trắng làm nền
- Arrow `→` làm affordance cho links/buttons
- Label UPPERCASE + tracking-widest cho nav
- Border radius: `rounded-lg` (8px) cho inputs, `rounded-xl` (12px) cho cards

---

## API Reference

Base URL local: `http://localhost:3000/api/v1`  
Base URL production: `https://tvdl.duonglieu.edu.vn/api/v1` *(hoặc IP VPS)*

### Public endpoints (không cần auth)

```
GET  /books
     ?search=     (tên sách, tác giả)
     ?age_group_id=
     ?category_id=
     ?cursor=      (cursor-based pagination)
     ?limit=       (default 20)
     → { status, data: Book[], meta: { nextCursor } }

GET  /age-groups
     → { status, data: AgeGroup[] }

GET  /new-books
     ?cursor=
     ?limit=       (default 12)
     → { status, data: NewBook[], meta: { nextCursor } }
     NewBook có: title, author, cover_image, short_description, category, location

GET  /schedules
     ?month=       (1-12, bắt buộc)
     ?year=        (bắt buộc)
     → { status, data: Schedule[] }
     Schedule có: id, date, shift, time_frame, location { name, color_code }, custom_location_name, is_sudden_closed, closed_reason

POST /suggestions
     body: { book_title, requester_name?, note? }
     → { status, message }
```

### Admin endpoints (JWT Bearer required)

Token lưu ở `localStorage` key `tvdl_token`. Dùng instance `adminApi` từ `lib/api.js` — nó tự gắn header và redirect về `/admin/login` khi 401.

```
POST /admin/auth/login
     body: { username, password }
     → { status, data: { token } }

POST /admin/schedules/bulk
     body: { dates[], shift, time_frame, location_id?, custom_location_name? }
     → { status, data: { created } }

POST /admin/schedules/generate
     body: { from, to }   # sinh lịch từ Schedule_Templates, chống trùng
     → { status, data: { created, skipped } }

GET  /admin/new-books?page=&limit=
     → { status, data: NewBook[], meta: { total, totalPages } }
POST /admin/new-books
PUT  /admin/new-books/:id
DELETE /admin/new-books/:id

GET  /admin/schedules?month=&year=
POST /admin/schedules
PUT  /admin/schedules/:id
DELETE /admin/schedules/:id

GET  /admin/suggestions?page=&limit=
```

**Response envelope chuẩn:**
```json
{ "status": "success|error", "error_code": "...", "message": "...", "data": {}, "meta": {} }
```

---

## Trạng thái hiện tại

### Backend — HOÀN CHỈNH
- 28/28 API tests pass
- CI/CD auto-deploy lên VPS khi push `main`
- DB đã seed trên production

### Frontend — Skeleton xong, cần polish

**Đã có (không cần làm lại):**
- Tất cả pages và routes (public + admin)
- API calls nối đúng endpoint
- Auth guard (`RequireAuth`) cho admin
- Design tokens trong `index.css`
- Proxy Vite dev server

**Chưa làm — xem danh sách nhiệm vụ bên dưới**

---

## Danh sách nhiệm vụ (theo thứ tự ưu tiên)

### 1. Foundation (làm trước)

**1a. Thêm Category filter vào BooksPage**  
File: `frontend/src/pages/public/BooksPage.jsx`  
- Gọi `GET /categories` (endpoint cần verify có không — nếu không có, bỏ qua)  
- Thêm `<select>` filter Category bên cạnh Age Group filter hiện tại  
- Khi thay đổi, reset books và fetch lại với `?category_id=`

**1b. Favicon**  
- Tạo file `frontend/public/favicon.svg` — logo đơn giản hình vuông nền `#1B3F8B`, chữ "TV" trắng  
- `index.html` đã link đúng `href="/favicon.svg"` rồi

---

### 2. Responsive & Mobile

**2a. HubPage mobile**  
File: `frontend/src/pages/public/HubPage.jsx`  
- Hero text: đổi `text-hero` (6rem cứng) thành responsive — `text-5xl md:text-7xl lg:text-[6rem]`  
- Tile grid: đổi `grid-cols-2` thành `grid-cols-1 sm:grid-cols-2`

**2b. Navbar mobile**  
File: `frontend/src/components/layout/Navbar.jsx`  
- Desktop (≥768px): giữ nguyên layout hiện tại  
- Mobile (<768px): ẩn nav items, hiện hamburger button bên phải logo  
- Menu mở ra: full-width dropdown với các links xếp dọc  
- Đóng menu khi click link hoặc click ngoài

**2c. SchedulePage mobile**  
File: `frontend/src/pages/public/SchedulePage.jsx`  
- Mobile (<768px): ẩn calendar grid (`hidden md:block`), chỉ hiện sidebar list  
- Sidebar list trên mobile: full-width, bỏ layout flex 2 cột  
- Calendar cell `min-h-[72px]`: đổi thành `min-h-[52px] md:min-h-[72px]`

---

### 3. UX Improvements

**3a. Skeleton loading — BooksPage**  
File: `frontend/src/pages/public/BooksPage.jsx`  
- Thay text "Đang tải..." bằng skeleton grid: 10 `<div>` với `animate-pulse`, shape giống BookCard

**3b. Skeleton loading — NewBooksPage**  
File: `frontend/src/pages/public/NewBooksPage.jsx`  
- Tương tự — skeleton dạng horizontal card khi `loading === true` và `books.length === 0`

**3c. Infinite scroll — NewBooksPage**  
File: `frontend/src/pages/public/NewBooksPage.jsx`  
- Xóa nút "→ Xem thêm"  
- Dùng `IntersectionObserver` để tự động gọi `fetchMore()` khi user scroll gần cuối trang  
- Đặt một `<div ref={sentinelRef}>` ở dưới cùng list, observe nó

**3d. Empty state — BooksPage**  
File: `frontend/src/pages/public/BooksPage.jsx`  
- Thay `<p className="text-center text-muted...">Không tìm thấy sách nào</p>`  
- Bằng một box đẹp hơn: icon sách lớn + text + gợi ý "Thử tìm kiếm khác"

**3e. Tooltip schedule — SchedulePage**  
File: `frontend/src/pages/public/SchedulePage.jsx`  
- Calendar cell đang hiện chỉ `time_frame` (text nhỏ 9px, truncate)  
- Thêm `title` attribute đã có rồi (native browser tooltip) — kiểm tra xem có hoạt động chưa  
- Nếu muốn custom tooltip: dùng CSS `group/peer` của Tailwind, hiện div khi hover

---

### 4. Admin UX

**4a. Toast notifications**  
- Tạo component `frontend/src/components/ui/Toast.jsx` — hiện message 3 giây rồi tự ẩn  
- Variants: `success` (nền xanh), `error` (nền đỏ)  
- Thay tất cả `alert()` và `window.confirm()` trong admin pages bằng toast + confirm dialog đẹp  
- Files cần sửa: `AdminNewBooksPage.jsx`, `AdminSchedulesPage.jsx`

**4b. Form validation inline**  
- Trong các modal form của admin, validate trước khi submit  
- Hiện error message ngay dưới field thay vì alert  
- Required fields: `title` cho New Books, `date + time_frame` cho Schedules

---

### 5. Pre-deploy checklist

- [ ] `<meta name="description">` trong `index.html`: "Thư viện Dương Liễu — Tra cứu sách, lịch hoạt động"
- [ ] `<meta property="og:title">` và `og:description`
- [ ] Test thực tế trên điện thoại (Chrome DevTools không thay thế được)
- [ ] Verify Nginx đã config `try_files $uri /index.html` cho SPA routing

---

## Ghi chú quan trọng

- **Không implement** chức năng mượn/trả sách — đó là Skoolib lo
- **ServicesPage** (`/services`): chờ content từ client, chỉ cần giữ placeholder hiện tại
- **AboutPage** (`/about`): chờ illustration từ client
- **Social links** trong Navbar (Facebook, Instagram, YouTube): để `href="https://facebook.com"` tạm, client sẽ cung cấp link thật
- Khi client cung cấp logo thật: thay `<div className="w-9 h-9 bg-blue...">TV</div>` trong Navbar bằng `<img src="/logo.png" alt="Thư viện Dương Liễu" className="h-9" />`

---

## Deployment

CI/CD GitLab tự động deploy khi push lên `main`. Xem `.gitlab-ci.yml` để biết chi tiết pipeline.

```bash
# SSH vào VPS nếu cần can thiệp thủ công
ssh -p 24700 root@103.166.182.105

# Restart backend
pm2 restart tvdl-backend

# Xem logs
pm2 logs tvdl-backend
```
