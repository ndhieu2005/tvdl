#!/bin/bash
BASE="http://localhost:3000/api/v1"
PASS=0
FAIL=0

# check "label" actual_status expected_status
check() {
  local label="$1"
  local actual="$2"
  local expected="${3:-200}"
  if [ "$actual" -eq "$expected" ]; then
    echo "  PASS [$actual] $label"
    PASS=$((PASS+1))
  else
    echo "  FAIL [got=$actual, want=$expected] $label"
    cat /tmp/r | python3 -c "import sys,json; d=json.load(sys.stdin); print('       ', d.get('message',''))" 2>/dev/null || true
    FAIL=$((FAIL+1))
  fi
}

echo ""
echo "=== PUBLIC ROUTES ==="

echo ""
echo "-- Books --"
R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/books")
check "GET /books (no filter)" $R

R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/books?search=khoa")
check "GET /books?search=khoa" $R

R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/books?age_group_id=1")
check "GET /books?age_group_id=1" $R

echo ""
echo "-- Schedules --"
R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/schedules?month=5&year=2026")
check "GET /schedules?month=5&year=2026" $R

R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/schedules")
check "GET /schedules (no params)" $R 400

R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/schedules?month=13&year=2026")
check "GET /schedules (invalid month)" $R 400

echo ""
echo "-- New Books --"
R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/new-books")
check "GET /new-books" $R

R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/new-books?limit=5")
check "GET /new-books?limit=5" $R

echo ""
echo "-- Events --"
R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/events")
check "GET /events" $R

echo ""
echo "-- Suggestions (POST) --"
R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/suggestions" \
  -H "Content-Type: application/json" \
  -d '{}')
check "POST /suggestions (no reader_code)" $R 400

R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/suggestions" \
  -H "Content-Type: application/json" \
  -d '{"reader_code":"NOTEXIST"}')
check "POST /suggestions (invalid reader_code)" $R 404

echo ""
echo "=== ADMIN AUTH ==="

echo ""
echo "-- Login --"
R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}')
check "POST /admin/auth/login (wrong pass)" $R 401

R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
check "POST /admin/auth/login (correct)" $R 200
TOKEN=$(cat /tmp/r | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])" 2>/dev/null)

echo ""
echo "-- Protected without token --"
R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/admin/new-books")
check "GET /admin/new-books (no token)" $R 401

if [ -z "$TOKEN" ]; then
  echo ""
  echo "  WARN: Không lấy được token — bỏ qua test admin có auth"
else
  echo "  Token OK: ${TOKEN:0:40}..."

  echo ""
  echo "=== ADMIN SCHEDULES ==="

  R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/admin/schedules?month=5&year=2026" \
    -H "Authorization: Bearer $TOKEN")
  check "GET /admin/schedules?month=5&year=2026" $R

  R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/admin/schedules" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"date":"2026-05-15","shift":"morning","time_frame":"08:00-11:00","location_id":1}')
  check "POST /admin/schedules" $R 201
  SCHEDULE_ID=$(cat /tmp/r | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['id'])" 2>/dev/null)

  R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/admin/schedules" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"date":"2026-05-15","shift":"morning","time_frame":"08:00-11:00"}')
  check "POST /admin/schedules (no location)" $R 400

  if [ -n "$SCHEDULE_ID" ]; then
    R=$(curl -s -o /tmp/r -w "%{http_code}" -X PUT "$BASE/admin/schedules/$SCHEDULE_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"is_sudden_closed":true,"closed_reason":"Sửa chữa"}')
    check "PUT /admin/schedules/$SCHEDULE_ID" $R

    R=$(curl -s -o /tmp/r -w "%{http_code}" -X DELETE "$BASE/admin/schedules/$SCHEDULE_ID" \
      -H "Authorization: Bearer $TOKEN")
    check "DELETE /admin/schedules/$SCHEDULE_ID" $R

    R=$(curl -s -o /tmp/r -w "%{http_code}" -X DELETE "$BASE/admin/schedules/$SCHEDULE_ID" \
      -H "Authorization: Bearer $TOKEN")
    check "DELETE /admin/schedules/$SCHEDULE_ID (already deleted)" $R 404
  fi

  echo ""
  echo "=== ADMIN NEW BOOKS ==="

  R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/admin/new-books" \
    -H "Authorization: Bearer $TOKEN")
  check "GET /admin/new-books" $R

  CAT_ID=$(node -e "const p=require('./src/lib/prisma'); p.categories.findFirst().then(c=>{console.log(c.id);p.\$disconnect()}).catch(()=>process.exit(1))" 2>/dev/null)

  R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/admin/new-books" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Sách test\",\"author\":\"Tác giả test\",\"location_id\":1,\"category_id\":$CAT_ID}")
  check "POST /admin/new-books" $R 201
  NEWBOOK_ID=$(cat /tmp/r | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['id'])" 2>/dev/null)

  R=$(curl -s -o /tmp/r -w "%{http_code}" -X POST "$BASE/admin/new-books" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"author":"Thiếu title"}')
  check "POST /admin/new-books (no title)" $R 400

  if [ -n "$NEWBOOK_ID" ]; then
    R=$(curl -s -o /tmp/r -w "%{http_code}" -X PUT "$BASE/admin/new-books/$NEWBOOK_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"title":"Sách test (đã sửa)"}')
    check "PUT /admin/new-books/$NEWBOOK_ID" $R

    R=$(curl -s -o /tmp/r -w "%{http_code}" -X DELETE "$BASE/admin/new-books/$NEWBOOK_ID" \
      -H "Authorization: Bearer $TOKEN")
    check "DELETE /admin/new-books/$NEWBOOK_ID (soft delete)" $R

    R=$(curl -s -o /tmp/r -w "%{http_code}" -X DELETE "$BASE/admin/new-books/$NEWBOOK_ID" \
      -H "Authorization: Bearer $TOKEN")
    check "DELETE /admin/new-books/$NEWBOOK_ID (already soft deleted)" $R 404
  fi

  echo ""
  echo "=== ADMIN SUGGESTIONS ==="

  R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/admin/suggestions" \
    -H "Authorization: Bearer $TOKEN")
  check "GET /admin/suggestions" $R

  R=$(curl -s -o /tmp/r -w "%{http_code}" "$BASE/admin/suggestions?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN")
  check "GET /admin/suggestions?page=1&limit=5" $R
fi

echo ""
echo "=============================="
echo "  PASS: $PASS  |  FAIL: $FAIL"
echo "=============================="
