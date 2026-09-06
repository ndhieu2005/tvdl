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

## Deployment (VPS Azure, Docker Compose)

- VPS: Ubuntu (Azure), IP `172.188.56.127`, SSH: `ssh -i ~/.ssh/tvdl_secret.pem admintvdl@172.188.56.127`
- App path: `/home/admintvdl/tvdl` — git clone của repo, chạy bằng Docker Compose
- Containers: `tvdl_mysql` (internal-only), `tvdl_backend` (internal-only), `tvdl_frontend` (Nginx, host port 80)
- Secrets: `/home/admintvdl/tvdl/.env` (chỉ tồn tại trên VPS, xem `.env.example`)
- CI/CD: GitHub Actions (`.github/workflows/deploy.yml`) — push to `main` → self-hosted runner trên VPS → `git pull && docker compose up -d --build && prisma migrate deploy`
- Seed DB: workflow `Seed DB (manual)` chạy tay từ tab Actions
- Lưu ý: VPS này còn chạy project khác (`vms_*` containers, ports 3000/3001/3307/6379) — không đụng vào

```bash
cd ~/tvdl && docker compose ps            # Trạng thái containers
docker compose logs backend --tail=50     # View logs
docker compose up -d --build              # Rebuild + restart thủ công
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

**Legacy tables** (từng sync từ Skoolib — tính năng sync đã gỡ, data giữ nguyên):
- `Readers` (has `reader_code`), `Books` (has `category_id`) — Books → Categories is **1-N**

**Website-generated tables**:
- `New_Books` (has `category_id`), `Book_Suggestions`, `Schedule_Templates`
- `Schedules` (has `custom_location_name`, `is_sudden_closed`), `Events`

Soft-delete pattern (`deleted_at DateTime?`) used on: `Admins`, `Age_Groups`, `Categories`, `Locations`, `Readers`, `Books`, `New_Books`, `Events`.

## Key Business Logic

### Schedule / Location Logic
- If location is Cơ sở 1 or Cơ sở 2 → use foreign key to `Locations`
- Otherwise → write free-text directly into `Schedules.custom_location_name`
- `Schedule_Templates` định nghĩa lịch chuẩn theo thứ-trong-tuần (`day_of_week` 0=CN..6=T7); endpoint `POST /admin/schedules/generate {from,to}` sinh lịch từ templates, chống trùng theo `date + shift + time_frame`

### Tra cứu sách
- Frontend không có trang search nội bộ — mọi nút "Tra cứu" link thẳng sang Skoolib OPAC (tab mới)
- Tính năng đồng bộ Skoolib (upload Excel) đã gỡ; API public `/books` vẫn tồn tại nhưng không có UI dùng

## Frontend Pages

**Public**: HubPage (home menu), Activity schedule (kèm events), New books, Posts (/news, /news/:slug), Services & Regulations

**Admin** (JWT protected): Login, Schedule management (kèm weekly templates + generate), Events, New books, Posts (TipTap editor), Suggestion statistics

## Backend Status

**Tất cả routes hoàn chỉnh — 48/48 API tests pass**

```bash
cd backend && bash scripts/test-api.sh   # Requires backend running + seeded DB
```

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

## Frontend Roadmap

### ✅ Đã xong (cập nhật 07/2026)
- **Phase 0 — Skeleton**: Vite + React + Tailwind v4 + Router + Axios, đủ pages/routes public + admin, auth guard
- **Phase 1 — Foundation**: title + favicon thật, font Be Vietnam Pro, `VITE_API_URL` qua env (fallback `/api/v1` cho proxy)
- **Phase 2 — Responsive cơ bản**: HubPage hero + tiles mobile 1 cột, calendar SchedulePage responsive, NewBooks nút "Xem thêm"
- **Phase 3 — Navbar**: hamburger mobile, dropdown Dịch vụ, active state theo route (`aria-current`)
- **Phase 4 — Admin**: Toast + ConfirmDialog thay `alert()`/`confirm()` trần, bộ UI dùng chung (`FormField`, `Pagination`, hook `useCrudList`), upload ảnh báo lỗi inline
- **Phase 5 — Pre-deploy**: meta description + OG tags, nginx SPA fallback, CI build + deploy qua GitHub Actions
- **Yêu cầu client 07/2026** (file docx): Events đủ trường + chọn màu (6 preset) + toggle nổi bật; Posts TipTap + tóm tắt + ảnh bìa; mọi nút tra cứu → Skoolib OPAC; New books đủ trường + upload file (`/admin/uploads`, multer); lịch public tô vàng + sao + badge "Nổi bật" cho sự kiện featured
- **Polish 07/2026**: SchedulePage mobile ẩn grid chỉ hiện danh sách + tooltip hover chi tiết ca/sự kiện (desktop); NewBooks + Posts infinite scroll (IntersectionObserver); validation inline mọi form admin (`FormField` prop `error`, `useCrudList` option `validate`); skeleton loading `animate-pulse` các trang public; header mobile gọn lại (vừa màn 375px)

### ⏳ Còn lại (làm khi có yêu cầu)
- [ ] Trang Về Thư viện & Dịch vụ: chờ content/illustration từ client
- [ ] Test trên điện thoại thật (mọi kiểm tra mobile hiện qua headless Chrome; lưu ý Chrome headless có min-width ~500px, không giả lập được viewport <500)
