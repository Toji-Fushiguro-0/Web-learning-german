# Deutsch Lernwelt

Ứng dụng web tự học tiếng Đức A1 — HTML/CSS/JS thuần, không cần build, dữ liệu cá nhân lưu trong `localStorage`, có thể sao lưu lên Cloudflare (tuỳ chọn).

## Chạy

**Cách nhanh nhất (Windows):** nhấp đôi **`start.bat`** — tự mở `http://localhost:8080`.

Hoặc bằng lệnh:

```powershell
npm run serve          # http://localhost:8080
```

hoặc `npx serve .`, `python -m http.server 8080`, hay VS Code Live Server.

> **Mở trực tiếp `index.html` vẫn chạy được**: trình duyệt chặn `fetch()` trên `file://`, nên app tự chuyển sang dữ liệu nhúng trong `data/embedded-data.js`.
> Dữ liệu nhúng chỉ cập nhật khi chạy `npm run build:data` — sau khi sửa `data/*.json` thì chạy lại lệnh này (hoặc dùng server để luôn đọc bản mới nhất).

## Kiểm thử

```powershell
npm test
```

Ba bộ test chạy bằng Node, không cần trình duyệt:

| File | Nội dung |
|---|---|
| `tests/sync.test.mjs` | Backend chạy trên **SQLite thật** (`node:sqlite`): schema, auth, PUT/GET round-trip, validate, CORS, 512KB, summary, tách người dùng + logic quyết định đồng bộ |
| `tests/ui.test.mjs` | DOM giả lập: render danh sách bài theo trình độ, chế độ xem trước, bật/tắt |
| `tests/static.test.mjs` | Nhất quán HTML/JS/CSS: id tồn tại, script được nạp, không trùng hàm, biến CSS, dark mode |
| `tests/i18n.test.mjs` | Từ điển vi/en: khoá dùng trong HTML/JS đều tồn tại, không bản dịch rỗng, nạp đúng thứ tự |

Bộ test cũ `js/run-tests.js` vẫn dùng được: dán vào Console trình duyệt. Nó có cơ chế chụp/khôi phục dữ liệu thật nên không xoá tiến độ.

## Cấu trúc

```
index.html              5 view: dashboard, grammar, lesson-detail, vocabulary, placeholder
start.bat               mở app bằng server cục bộ (Windows)
css/style.css           design system, dark mode, modal, chế độ xem trước
js/
  data-loader.js        fetch + cache JSON
  data-validator.js     kiểm tra schema
  storage.js            localStorage, điểm, xu, streak, lỗi sai
  grammar-data.js       GRAMMAR_LESSONS (metadata + lý thuyết)
  grammar.js            danh sách bài theo trình độ, chấm điểm
  vocabulary.js         flashcard + bảng từ vựng
  sync-core.js          logic so sánh local ↔ cloud (testable)
  cloud-sync.js         UI + gọi API Cloudflare (tuỳ chọn)
  preview.js            mở khóa mục "Sắp ra" để xem trước
  i18n.js               chuỗi giao diện vi/en (t, I18N)
  app.js                khởi động, điều hướng view, dashboard, theme
  run-tests.js          bộ test dán tay vào Console
data/
  grammar.json          30 câu hỏi A1, 7 chủ đề
  vocabulary.json       50 từ A1, 9 chủ đề
  embedded-data.js      bản nhúng tự sinh (npm run build:data) cho chế độ file://
worker/                 Worker + D1: index.mjs (API), repository.mjs (validate/tách-ghép), schema.sql
tests/                  test chạy bằng Node
tools/serve.js          server tĩnh nhỏ
tools/build-embedded-data.js  sinh dữ liệu nhúng từ data/*.json
```

## Tính năng

- **Ngữ pháp A1**: 7 bài, 30 câu hỏi; tiến độ, điểm cao nhất, lưu lỗi sai.
- **Từ vựng**: 50 từ, flashcard lật 3D, tìm kiếm, lọc chủ đề, bảng danh sách.
- **Điểm & xu**: 10 điểm/câu đúng; xu: +1/câu ngữ pháp đúng, +5 khi đúng 100%, +2/từ nhớ đúng, +10 khi đạt mục tiêu ngày. Ôn lỗi sai không kiếm xu.
- **Streak & mục tiêu ngày**: tự reset khi qua ngày; streak hiển thị 0 nếu đã nghỉ quá 1 ngày.
- **Dark / light mode**: nút trên header, mặc định theo hệ điều hành, ghi nhớ lựa chọn, chuyển mượt.
- **Giao diện vi/en**: nút VI/EN trên header, ghi nhớ lựa chọn; chỉ dịch phần giao diện, nội dung bài học giữ tiếng Việt.
- **Chế độ xem trước** (mặc định BẬT): mở khóa 5 mục đang phát triển và các tab trình độ A2/B1/B2 để xem giao diện dự kiến. Tắt bằng nút ở chân sidebar.
- **Đồng bộ Cloudflare** (tuỳ chọn): xem `CLOUDFLARE.md`.

## Dữ liệu

- `localStorage["deutsch_lernwelt_user_data_v2"]` — toàn bộ dữ liệu học tập (`_version: 3`).
- `localStorage["deutsch_lernwelt_theme"]` — `light` / `dark`.
- `localStorage["deutsch_lernwelt_lang"]` — `vi` / `en`.
- `localStorage["deutsch_lernwelt_preview"]` — `1` / `0`.
- `localStorage["deutsch_lernwelt_cloud_v1"]` — `{ apiUrl, token }` nếu đã bật đồng bộ.

Nút **Reset dữ liệu** ở chân sidebar xoá toàn bộ dữ liệu cá nhân (không xoá nội dung bài học).

## Hướng phát triển

- Sổ tay lỗi sai có giao diện thật (dữ liệu đã sẵn sàng).
- Ôn tập ngắt quãng dùng `getWordsToReview()`.
- Mở nội dung A2, thêm dạng câu hỏi điền từ / sắp xếp từ.
- Cửa hàng tiêu xu.
- Tách ES modules + router hash (xem ghi chú trong lịch sử trao đổi).
