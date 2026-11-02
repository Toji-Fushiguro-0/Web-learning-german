// js/data-loader.js
// Module tải dữ liệu từ file JSON và cache vào bộ nhớ
// Sử dụng Fetch API — trình duyệt hiện đại đều hỗ trợ

/**
 * Cache bộ nhớ trong phiên làm việc — tránh đọc file nhiều lần
 * Ví dụ: DATA_CACHE["grammar"] sẽ chứa nội dung grammar.json
 */
const DATA_CACHE = {};

/**
 * Tải một file JSON theo đường dẫn tương đối
 * 
 * @param {string} key   - Tên ngắn để lưu cache (vd: "grammar", "vocabulary")
 * @param {string} path  - Đường dẫn tới file JSON (vd: "data/grammar.json")
 * @returns {Promise<object>} - Dữ liệu JSON đã được parse
 *
 * Giải thích async/await cho người mới học:
 * - "async" nghĩa là hàm này chạy bất đồng bộ (không block trang)
 * - "await" nghĩa là "hãy đợi lệnh này xong rồi mới chạy tiếp"
 * - Giống như gọi đồ ăn: bạn đặt món (fetch), đợi (await), nhận đồ ăn (dữ liệu)
 */
async function loadData(key, path) {
  // Nếu đã load rồi thì dùng cache, không cần tải lại
  if (DATA_CACHE[key]) {
    return DATA_CACHE[key];
  }

  try {
    const response = await fetch(path);

    // Kiểm tra xem server có trả về OK không (HTTP status 200-299)
    if (!response.ok) {
      throw new Error(`Không thể tải file dữ liệu: ${path} (HTTP ${response.status})`);
    }

    const data = await response.json();
    DATA_CACHE[key] = data;
    return data;

  } catch (err) {
    // Nguyên nhân thường gặp: mở file:// (fetch bị chặn), thiếu file, hoặc JSON hỏng.
    // Phương án dự phòng: dùng bản nhúng trong data/embedded-data.js
    const embedded = getEmbeddedData(key);
    if (embedded) {
      console.warn(`[DataLoader] Không tải được ${path} (${err.message}) — chuyển sang dữ liệu nhúng.`);
      DATA_CACHE[key] = embedded;
      notifyEmbeddedMode();
      return embedded;
    }

    console.error(`[DataLoader] Lỗi tải ${key}:`, err.message);

    // Ném lỗi ra ngoài để phần gọi hàm có thể xử lý
    throw err;
  }
}

/**
 * Lấy dữ liệu nhúng (nếu có). Sinh bởi: npm run build:data
 */
function getEmbeddedData(key) {
  if (typeof window === "undefined" || !window.EMBEDDED_DATA) return null;
  return window.EMBEDDED_DATA[key] || null;
}

let embeddedNoticeShown = false;

/**
 * Thông báo một lần khi app chạy bằng dữ liệu nhúng (thường là do mở file://).
 */
function notifyEmbeddedMode() {
  if (embeddedNoticeShown) return;
  embeddedNoticeShown = true;

  // Ghi lại để dễ kiểm tra trong Console
  window.DATA_SOURCE = "embedded";

  if (typeof window.showToastMessage === "function") {
    window.showToastMessage("📦 Đang dùng dữ liệu nhúng. Chạy qua localhost để dùng bản mới nhất.");
  }
}

/**
 * Tải dữ liệu ngữ pháp
 */
async function loadGrammarData() {
  return loadData("grammar", "data/grammar.json");
}

/**
 * Tải dữ liệu từ vựng
 */
async function loadVocabularyData() {
  return loadData("vocabulary", "data/vocabulary.json");
}

/**
 * Tải bộ câu hỏi kiểm tra xếp trình độ
 */
async function loadPlacementData() {
  return loadData("placement", "data/placement.json");
}

/**
 * Xóa cache (dùng khi muốn tải lại dữ liệu fresh)
 */
function clearDataCache(key) {
  if (key) {
    delete DATA_CACHE[key];
  } else {
    Object.keys(DATA_CACHE).forEach(k => delete DATA_CACHE[k]);
  }
}

// ============================================================
// CHẠY BẰNG CÁCH NÀO?
//
// Cách 1 (khuyến nghị) — server cục bộ:
//   npm run serve            → http://localhost:8080
//   hoặc nhấp đôi start.bat  → tự mở trình duyệt
//   hoặc: python -m http.server 8080
//
// Cách 2 — mở thẳng index.html bằng file://:
//   Trình duyệt chặn fetch() trên file://, nên app tự chuyển sang dữ liệu
//   nhúng trong data/embedded-data.js (sinh bằng: npm run build:data).
//   Vẫn dùng được đầy đủ, chỉ là dữ liệu có thể cũ hơn data/*.json.
// ============================================================
