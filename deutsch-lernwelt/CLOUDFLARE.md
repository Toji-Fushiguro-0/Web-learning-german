# Kết nối Cloudflare (gói miễn phí)

Mục tiêu: sao lưu dữ liệu học tập lên **Cloudflare Workers + D1** để không mất khi xoá dữ liệu trình duyệt hoặc đổi máy. Ứng dụng vẫn chạy 100% khi không cấu hình — phần này là tuỳ chọn.

## Kiến trúc

```
Trình duyệt (localStorage)  ⇄  Worker (API, workers.dev)  ⇄  D1 (SQLite, bảng chuẩn hoá)
        local-first          Bearer token + validate      1 bộ bản ghi / người dùng
```

- File client: `js/sync-core.js` (logic quyết định), `js/cloud-sync.js` (gọi API + UI).
- File server: `worker/src/index.mjs` (route), `worker/src/repository.mjs` (validate + tách/ghép dữ liệu), `worker/schema.sql`, `worker/wrangler.toml`.
- Hợp đồng API với client **không đổi**: client vẫn gửi/nhận nguyên object state; server chịu trách nhiệm chuẩn hoá.
- Gói miễn phí: Workers 100.000 request/ngày, D1 5 GB, không cần thẻ tín dụng.

## Cấu trúc dữ liệu (D1)

Dữ liệu không còn lưu thành một khối JSON mà tách theo bảng quan hệ:

| Bảng | Khoá | Nội dung |
|---|---|---|
| `users` | `id` | tên hiển thị, trình độ mục tiêu, phiên bản schema, client ghi lần cuối |
| `user_stats` | `user_id` | tổng điểm, xu, streak, ngày hoạt động cuối |
| `daily_goals` | `user_id` | mục tiêu ngày, số câu đúng/đã làm, ngày đã nhận thưởng |
| `lesson_progress` | `(user_id, lesson_id)` | điểm, tổng câu, số lần làm, điểm cao nhất |
| `vocabulary_progress` | `(user_id, word_id)` | trạng thái, số lần đúng/sai, lần ôn cuối |
| `mistakes` | `id` | lỗi sai: câu hỏi, đáp án, giải thích, đã hiểu hay chưa |
| `sessions` | `id` | lịch sử phiên học (giữ thứ tự bằng cột `position`) |
| `coin_transactions` | `id` | lịch sử cộng xu |
| `schema_migrations` | `id` | phiên bản schema đã áp dụng |

Quan hệ: mọi bảng dữ liệu đều tham chiếu `users(id)`; thư mục `worker/schema.sql` tạo khoá ngoại và chỉ mục cho các truy vấn thường dùng.

## API

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/health` | kiểm tra sống (không cần token) |
| GET | `/api/state` | đọc các bảng, ghép thành state trả cho client |
| PUT | `/api/state` | validate rồi tách state ghi vào các bảng |
| GET | `/api/summary` | số liệu tổng hợp đọc trực tiếp từ bảng |

`PUT /api/state` kiểm tra cấu trúc trước khi ghi (kiểu số/object/mảng, `mistakes[].id`, giới hạn số phần tử) và trả `400` kèm `details` nếu sai.

## Các bước (làm một lần, ~5 phút)

Tất cả lệnh chạy tại thư mục dự án `D:\deutsch-lernwelt`.

### 1. Đăng nhập Cloudflare

```powershell
npx wrangler@latest login
```

Trình duyệt mở ra → đăng nhập (hoặc tạo tài khoản miễn phí) → **Allow**.

### 2. Tạo database D1

```powershell
npm run db:create
```

Lệnh in ra một `database_id` dạng UUID. Mở `worker/wrangler.toml`, thay:

```toml
database_id = "REPLACE_WITH_DATABASE_ID"
```

bằng id vừa nhận.

### 3. Tạo bảng

```powershell
npm run db:init
```

### 4. Đặt token bí mật

```powershell
npx wrangler@latest secret put SYNC_TOKEN --config worker/wrangler.toml
```

Nhập một chuỗi ngẫu nhiên dài (tối thiểu 8 ký tự), ví dụ tạo bằng PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % { [char]$_ })
```

**Lưu lại token này** — bạn sẽ dán vào ứng dụng.

### 5. Triển khai Worker

```powershell
npm run worker:deploy
```

Kết quả in ra địa chỉ dạng:

```
https://deutsch-lernwelt-sync.<tên-tài-khoản>.workers.dev
```

### 6. Nối vào ứng dụng

1. Chạy app: `npm run serve` → mở `http://localhost:8080`.
2. Bấm biểu tượng ☁️ trên header.
3. Dán **API URL** và **Token** ở bước 5 và 4.
4. Bấm **Lưu & kết nối**.

Biểu tượng đổi thành ✅ khi đồng bộ xong. Từ đó mỗi lần học xong, dữ liệu tự đẩy lên sau ~2,5 giây.

## Kiểm tra

```powershell
curl https://deutsch-lernwelt-sync.<tên>.workers.dev/api/health
# → {"ok":true,...}
```

Test tự động phía server + logic đồng bộ (không cần mạng):

```powershell
npm test
```

## Dùng trên máy thứ hai

1. Cài đặt cùng API URL + token.
2. Lần đầu mở, app thấy cloud mới hơn máy → hỏi *"Tải bản cloud về?"* → đồng ý.

## Cách xử lý xung đột

- So sánh `_updatedAt` (local) với `savedAt` (cloud), sai số cho phép 2 giây.
- Cloud mới hơn + máy đã có dữ liệu → **hỏi trước khi ghi đè**.
- Máy mới hoàn toàn → tự tải bản cloud.
- Local mới hơn → tự đẩy lên.

## Bảo mật & giới hạn

- Token nằm trong `localStorage` → chỉ an toàn tương đối trên máy cá nhân. Muốn chắc hơn, nên bọc Worker bằng **Cloudflare Access** (Zero Trust, miễn phí tới 50 người dùng) với đăng nhập email OTP.
- API từ chối payload > 512 KB; dữ liệu hiện tại chỉ vài chục KB.
- Ghi dữ liệu phản chiếu đúng state của client: mỗi lần PUT, các bảng con được thay thế toàn bộ, nên không có bản ghi mồ côi.
- Chưa có lịch sử nhiều phiên bản (snapshot) — muốn có cần thêm bảng phiên bản.
- `SYNC_TOKEN` phải đặt qua `wrangler secret`, **không** ghi vào `wrangler.toml`.

## Sự cố thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| ☁️ báo "Token không đúng" | Token nhập sai hoặc chưa đặt secret | Chạy lại bước 4, dán lại token |
| Lỗi CORS trên Console | `ALLOWED_ORIGIN` không chứa origin đang dùng | Đổi thành `"*"` trong `wrangler.toml` hoặc thêm đúng origin |
| `npx` báo `EPERM` | Không ghi được cache npm (sandbox/antivirus) | Chạy lệnh ngoài sandbox, hoặc `npm config set cache D:\npm-cache` |
| `database_id` sai | Chưa thay placeholder | Chạy `npx wrangler d1 list` để lấy id |
| Worker 404 | Chưa deploy hoặc sai đường dẫn | Kiểm tra `/api/health` trước |

## Ghi chú

- Không có backend nào khác: app vẫn là static, Worker chỉ là 1 file.
- **Nếu đã từng deploy bản cũ** (một bảng `learning_state` chứa JSON): sau khi deploy bản mới, `GET /api/state` trả `404` (bảng mới còn trống) → client tự đẩy bản local lên và dữ liệu được tái tạo vào các bảng chuẩn hoá. Muốn dọn bảng cũ: `DROP TABLE learning_state;`.
- Muốn xoá hoàn toàn: `npx wrangler delete --config worker/wrangler.toml` và xoá database trong dashboard Cloudflare.
