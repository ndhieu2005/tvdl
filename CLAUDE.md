# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website Thư viện Dương Liễu (TVDL) — small-scale library website (~2000 traffic/month). Đây là **portal thông tin**, không hỗ trợ mượn/trả sách — nghiệp vụ đó do Skoolib xử lý riêng.

- **Backend**: `backend/` — Node.js, Express, Prisma ORM
- **Frontend**: `frontend/` — React.js, TailwindCSS

## Development Commands

### Backend
```bash
cd backend
npm install
npx prisma migrate dev     # Apply migrations
npx prisma generate        # Regenerate Prisma client
npx prisma studio          # GUI for database
npm run dev                # Start dev server (nodemon)
npm start                  # Start production server
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # Start Vite dev server (proxies /api → localhost:3000)
npm run build              # Build for production
npm run lint               # ESLint check
```

> Vite dev server proxies `/api` to `http://localhost:3000`, so frontend at port 5173 talks to backend without CORS issues. Both servers must run simultaneously during local development.

## Deployment (VPS)

- VPS: Ubuntu, IP `103.166.182.105`, SSH port `24700`
- Backend path: `/var/www/tvdl/backend/` — managed by PM2 (`tvdl-backend`), port `3000`
- Frontend path: `/var/www/tvdl/frontend/` — served by Nginx
- CI/CD: GitLab pipeline (`.gitlab-ci.yml`) — push to `main` → auto SSH → `git pull && npm install && pm2 restart`

```bash
pm2 restart tvdl-backend   # Restart backend
pm2 logs tvdl-backend      # View logs
```

## API Design

- All endpoints: `/api/v1/...`
- Standard response envelope:
  ```json
  { "status": "success|error", "error_code": "...", "message": "...", "data": {}, "meta": {} }
  ```
- Pagination: **cursor-based** for public frontend (infinite scroll), **page/limit** for admin
- Auth: JWT Bearer token required for all `/api/v1/admin/...` routes; token stored in `localStorage` as `tvdl_token`; the `adminApi` axios instance auto-redirects to `/admin/login` on 401

## Database Schema (Prisma + MySQL `tvdl_db`)

**System tables** (seeded/managed manually):
- `Admins`, `Age_Groups`, `Categories`, `Locations` — `Locations.type` distinguishes branches; `id=3` = Dự án lưu động

**Skoolib-synced tables** (full delete + bulk insert monthly via transaction):
- `Readers` (has `reader_code`), `Books` (has `category_id`) — Books → Categories is **1-N**

**Website-generated tables**:
- `New_Books` (has `category_id`), `Book_Suggestions`, `Schedule_Templates`
- `Schedules` (has `custom_location_name`, `is_sudden_closed`), `Events`

Soft-delete pattern (`deleted_at DateTime?`) used on: `Admins`, `Age_Groups`, `Categories`, `Locations`, `Readers`, `Books`, `New_Books`, `Events`.

## Key Business Logic

### Skoolib Sync Flow
1. Admin uploads `.xlsx` file
2. Parse Excel → auto-create any new `Categories` / `Age_Groups` if not exist
3. Wrap in a **single DB transaction**: delete all `Books` + `Readers`, then bulk insert new data

### Schedule / Location Logic
- If location is Cơ sở 1 or Cơ sở 2 → use foreign key to `Locations`
- Otherwise → write free-text directly into `Schedules.custom_location_name`

## Frontend Pages

**Public**: HubPage (home menu), Book search, Activity schedule, New books, Services & Regulations

**Admin** (JWT protected): Login, Skoolib sync (Excel upload), New books management, Schedule management, Suggestion statistics

## Backend Status

**Tất cả routes hoàn chỉnh — 28/28 API tests pass**

```bash
cd backend && bash scripts/test-api.sh   # Requires backend running + seeded DB
```

### Còn lại trước khi deploy lên VPS
- [x] **Seed production DB**: job `seed_db` manual trong GitLab CI — trigger 1 lần sau deploy đầu tiên
- [x] **Update `.gitlab-ci.yml`**: migrate DB tự động mỗi deploy; `npm run build` frontend đã có

## Frontend Design System

Font: **Be Vietnam Pro** (Google Fonts)

| Token | Hex | Dùng ở đâu |
|---|---|---|
| `blue` | `#1B3F8B` | Heading, logo, nav active dark, button border |
| `yellow` | `#F5C000` | Accent, nav active light, CHỦ NHẬT, dấu `!` |
| `dark` | `#2D2D2D` | Search bar, social nav |
| `cream` | `#F2EAD3` | Calendar cells, subtle bg |
| `muted` | `#9CA3AF` | Placeholder, caption |

Nguyên tắc: flat design, không shadow/gradient, chỉ 2 màu chủ, arrow `→` làm affordance, label UPPERCASE + tracking.

## Frontend Roadmap (thứ tự thực hiện)

### ✅ Phase 0 — Skeleton (DONE)
- Vite + React + Tailwind v4 + React Router + Axios
- Tất cả pages và routes đã có (public + admin)
- API integration đã nối, auth guard đã có
- Build thành công, 0 lỗi

### ⏳ Phase 1 — Foundation Fix
- [ ] Verify Tailwind v4 color/font tokens apply đúng trên browser
- [ ] `index.html`: title "Thư viện Dương Liễu", favicon
- [ ] Setup `VITE_API_URL` qua `.env`
- [ ] Test font Be Vietnam Pro load đúng

### ⏳ Phase 2 — Page Polish (theo thứ tự ưu tiên)

#### 2a. HubPage
- [ ] Full viewport height trừ navbar
- [ ] Hero text scale responsive (hiện `6rem` cứng)
- [ ] Mobile: tiles xếp 1 cột

#### 2b. Lịch hoạt động
- [ ] Calendar cell height responsive
- [ ] Mobile: ẩn grid, chỉ hiện danh sách
- [ ] Tooltip khi hover ca có lịch

#### 2c. Tra cứu sách
- [ ] UI filter Age Group + Category
- [ ] Skeleton loading thay text "Đang tải"
- [ ] Empty state đẹp

#### 2d. Sách mới
- [ ] Infinite scroll tự động (bỏ nút "Xem thêm")
- [ ] Ảnh placeholder đúng tỉ lệ

#### 2e. Về Thư viện & Dịch vụ
- [ ] Chờ content/illustration từ client

### ⏳ Phase 3 — Navbar & Navigation
- [ ] Active state đúng route
- [ ] Mobile: hamburger hoặc bottom nav
- [ ] Dropdown "Dịch vụ" nếu có submenu

### ⏳ Phase 4 — Admin Polish
- [ ] Toast notification thay `alert()`
- [ ] Form validation hiển thị inline
- [ ] Logo thật khi có file

### ⏳ Phase 5 — Pre-deploy
- [ ] `<meta>` SEO: title, description, OG tags
- [ ] Favicon thật
- [ ] Test mobile thực tế
- [ ] Nginx config: serve `dist/` + fallback `index.html` cho SPA
- [ ] Update `.gitlab-ci.yml`: build frontend trước khi deploy
