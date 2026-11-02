// js/i18n.js
// Đa ngôn ngữ cho PHẦN GIAO DIỆN (vi/en).
// Nội dung học (lý thuyết, câu hỏi, nghĩa từ vựng) giữ nguyên tiếng Việt.
//
// Cách dùng:
//   t("nav.dashboard")                        → chuỗi theo ngôn ngữ hiện tại
//   t("dash.goal.progress", {correct: 3, goal: 5, pct: 60})
//   <span data-i18n="nav.dashboard"></span>
//   <button data-i18n-title="header.theme">
//   <input data-i18n-placeholder="vocab.searchPlaceholder">

const I18N = (function () {
  "use strict";

  const STORAGE_KEY = "deutsch_lernwelt_lang";
  // Ứng dụng chỉ dùng tiếng Việt cho giao diện và tiếng Đức cho nội dung học.
  // Giữ nguyên cấu trúc đa ngôn ngữ để sau này có thể mở thêm, nhưng hiện chỉ bật "vi".
  const SUPPORTED = ["vi"];
  const EVENT = "languagechange";

  // Mỗi khoá có đủ vi + en để không bao giờ thiếu bản dịch.
  const DICT = {
    /* ---------------------------------------------------------------- menu */
    "nav.dashboard":        { vi: "Tổng quan", en: "Dashboard" },
    "nav.placement":        { vi: "Kiểm tra trình độ", en: "Level test" },
    "nav.grammar":          { vi: "Ngữ pháp (Grammatik)", en: "Grammar" },
    "nav.vocabulary":       { vi: "Từ vựng (Flashcard)", en: "Vocabulary" },
    "nav.hoeren":           { vi: "Luyện nghe (Hören)", en: "Listening" },
    "nav.lesen":            { vi: "Đọc hiểu (Lesen)", en: "Reading" },
    "nav.schreiben":        { vi: "Luyện viết (Schreiben)", en: "Writing" },
    "nav.mistakes":         { vi: "Sổ tay lỗi sai", en: "Mistake notebook" },
    "nav.ai":               { vi: "Trợ lý AI", en: "AI tutor" },
    "nav.group.main":       { vi: "Chính", en: "Main" },
    "nav.group.skills":     { vi: "Kỹ năng cốt lõi", en: "Core skills" },
    "nav.group.tools":      { vi: "Ôn tập & Công cụ", en: "Review & tools" },
    "badge.soon":           { vi: "Sắp ra", en: "Soon" },
    "badge.phase7":         { vi: "Giai đoạn 7", en: "Phase 7" },
    "badge.preview":        { vi: "Xem trước", en: "Preview" },

    /* ------------------------------------------------------------- tiêu đề */
    "title.dashboard":      { vi: "Tổng quan học tập", en: "Study overview" },
    "title.placement":      { vi: "Kiểm tra trình độ", en: "Level test" },
    "title.mistakes":       { vi: "Sổ tay lỗi sai", en: "Mistake notebook" },
    "title.grammar":        { vi: "Ngữ pháp tiếng Đức", en: "German grammar" },
    "title.vocabulary":     { vi: "Từ vựng & Flashcard", en: "Vocabulary & flashcards" },
    "title.lesson":         { vi: "Bài học", en: "Lesson" },
    "title.placeholder":    { vi: "Xem trước", en: "Preview" },

    /* --------------------------------------------------------------- header */
    "header.streak.title":  { vi: "Chuỗi ngày học liên tục", en: "Consecutive study days" },
    "header.points.title":  { vi: "Tổng điểm tích lũy", en: "Total points" },
    "header.coins.title":   { vi: "Xu tích lũy — kiếm được khi học bài mới", en: "Coins — earned by studying new lessons" },
    "header.theme":         { vi: "Chuyển giao diện sáng/tối", en: "Switch light/dark theme" },
    "header.cloud":         { vi: "Đồng bộ đám mây", en: "Cloud sync" },
    "header.menu":          { vi: "Mở menu", en: "Open menu" },
    "header.lang":          { vi: "Chuyển ngôn ngữ giao diện", en: "Switch interface language" },
    "theme.toLight":        { vi: "Chuyển sang giao diện sáng", en: "Switch to light theme" },
    "theme.toDark":         { vi: "Chuyển sang giao diện tối", en: "Switch to dark theme" },
    "unit.days":            { vi: "ngày", en: "days" },
    "unit.points":          { vi: "điểm", en: "points" },
    "unit.coins":           { vi: "xu", en: "coins" },

    /* -------------------------------------------------------------- sidebar */
    "sidebar.saved":        { vi: "💾 Lưu trên trình duyệt", en: "💾 Saved in browser" },
    "sidebar.reset":        { vi: "Reset dữ liệu", en: "Reset data" },
    "sidebar.reset.title":  { vi: "Xóa toàn bộ dữ liệu cá nhân để kiểm thử lại", en: "Delete all personal data to test again" },
    "sidebar.preview.on":   { vi: "👁️ Xem trước: BẬT", en: "👁️ Preview: ON" },
    "sidebar.preview.off":  { vi: "👁️ Xem trước: TẮT", en: "👁️ Preview: OFF" },
    "sidebar.preview.title": { vi: "Mở khóa toàn bộ để xem trước giao diện", en: "Unlock everything for a preview" },
    "sidebar.preview.onTitle": { vi: "Đang mở khóa toàn bộ để xem trước — bấm để khóa lại", en: "Everything is unlocked for preview — click to lock" },
    "sidebar.preview.offTitle": { vi: "Đang khóa các tính năng chưa hoàn thiện — bấm để mở khóa xem trước", en: "Unfinished features are locked — click to unlock" },

    /* ------------------------------------------------------------ dashboard */
    "dash.hero.title":      { vi: "Chào mừng bạn đến với Deutsch Lernwelt!", en: "Welcome to Deutsch Lernwelt!" },
    "dash.hero.text":       { vi: "Nền tảng tự học tiếng Đức cá nhân — từ A1 đến B2. Bắt đầu với ngữ pháp nền tảng và từ vựng cốt lõi.", en: "A personal German learning app — from A1 to B2. Start with core grammar and vocabulary." },
    "dash.hero.grammar":    { vi: "📘 Học Ngữ pháp A1 →", en: "📘 Study A1 grammar →" },
    "dash.hero.vocab":      { vi: "🗂️ Ôn Từ vựng", en: "🗂️ Review vocabulary" },
    "dash.metric.streak":   { vi: "Chuỗi ngày học (Streak)", en: "Study streak" },
    "dash.metric.lessons":  { vi: "Bài ngữ pháp A1 đã làm", en: "A1 grammar lessons done" },
    "dash.metric.known":    { vi: "Từ vựng đã thuộc", en: "Words known" },
    "dash.metric.learning": { vi: "Từ đang ôn tập", en: "Words in review" },
    "dash.metric.points":   { vi: "Tổng điểm tích lũy", en: "Total points" },
    "dash.metric.coins":    { vi: "Xu tích lũy (Coins)", en: "Coins" },
    "dash.metric.mistakes": { vi: "Lỗi chưa ôn lại", en: "Mistakes not reviewed" },
    "dash.goal.title":      { vi: "🎯 Mục tiêu hôm nay: Trả lời đúng 5 câu hỏi", en: "🎯 Today's goal: answer 5 questions correctly" },
    "dash.goal.done":       { vi: "🎉 <strong>Tuyệt vời!</strong> Bạn đã hoàn thành mục tiêu hôm nay ({correct}/{goal} câu đúng)!", en: "🎉 <strong>Great job!</strong> You hit today's goal ({correct}/{goal} correct)!" },
    "dash.goal.empty":      { vi: "Bạn chưa làm bài hôm nay. Hãy bắt đầu ngay nhé!", en: "You haven't studied today. Start now!" },
    "dash.goal.progress":   { vi: "Hôm nay đã trả lời đúng {correct}/{goal} câu ({pct}%). Tiếp tục phát huy!", en: "Today you answered {correct}/{goal} correctly ({pct}%). Keep going!" },
    "dash.streakValue":     { vi: "{n} ngày", en: "{n} days" },
    "dash.pointsValue":     { vi: "{n} điểm", en: "{n} points" },
    "dash.coinsValue":      { vi: "{n} xu", en: "{n} coins" },
    "dash.totalLessons":    { vi: "/ {n} bài", en: "/ {n} lessons" },

    /* -------------------------------------------------------------- grammar */
    "level.a1":             { vi: "Trình độ A1", en: "Level A1" },
    "level.a2":             { vi: "A2 (Khóa)", en: "A2 (locked)" },
    "level.b1":             { vi: "B1 (Khóa)", en: "B1 (locked)" },
    "level.b2":             { vi: "B2 (Khóa)", en: "B2 (locked)" },
    "grammar.badge.coming": { vi: "Sắp ra mắt", en: "Coming soon" },
    "grammar.badge.notOpen": { vi: "Chưa mở", en: "Locked" },
    "grammar.badge.best":   { vi: "✓ Điểm cao: {pct}%", en: "✓ Best: {pct}%" },
    "grammar.badge.ready":  { vi: "Sẵn sàng", en: "Ready" },
    "grammar.badge.locked": { vi: "🔒 Cần học trước", en: "🔒 Locked" },
    "grammar.action.locked": { vi: "Chưa mở", en: "Locked" },
    "grammar.lockNote":     { vi: "Cần hoàn thành: {lessons}", en: "Complete first: {lessons}" },
    "grammar.lockedToast":  { vi: "🔒 Bài này cần hoàn thành trước: {lessons}", en: "🔒 Finish these first: {lessons}" },
    "grammar.unit":         { vi: "Đơn vị {n}", en: "Unit {n}" },
    "grammar.action.review": { vi: "Ôn tập lại", en: "Review" },
    "grammar.action.study": { vi: "Học ngay", en: "Start" },
    "grammar.topic":        { vi: "Chủ đề: {topic}", en: "Topic: {topic}" },
    "grammar.lessonNo":     { vi: "Bài {n}: {title}", en: "Lesson {n}: {title}" },
    "grammar.questions":    { vi: " · {n} câu hỏi", en: " · {n} questions" },
    "grammar.notesTitle":   { vi: "💡 Lưu ý quan trọng:", en: "💡 Key notes:" },
    "grammar.qnum":         { vi: "Câu {n}:", en: "Question {n}:" },
    "grammar.extraExample": { vi: "Ví dụ thêm:", en: "Extra example:" },
    "grammar.empty.title":  { vi: "Trình độ {level} chưa có bài học", en: "{level} has no lessons yet" },
    "grammar.empty.text":   { vi: "Nội dung {level} đang được biên soạn. Hiện có {n} bài A1 để học.", en: "{level} content is being written. {n} A1 lessons are available." },
    "grammar.empty.back":   { vi: "← Về trình độ A1", en: "← Back to A1" },
    "grammar.exercise.correct": { vi: "✓ Chính xác!", en: "✓ Correct!" },
    "grammar.exercise.wrong": { vi: "✗ Chưa đúng! Đáp án đúng và giải thích:", en: "✗ Not quite! Correct answer and explanation:" },
    "grammar.exercise.unanswered": { vi: "⚠️ Bạn chưa chọn đáp án:", en: "⚠️ No answer selected:" },
    "grammar.result":       { vi: "Kết quả: {correct} / {total} câu đúng ({pct}%)", en: "Result: {correct} / {total} correct ({pct}%)" },
    "grammar.praise.perfect": { vi: "Tuyệt đối! Hoàn hảo! (Ausgezeichnet! 🌟)", en: "Perfect! (Ausgezeichnet! 🌟)" },
    "grammar.praise.great": { vi: "Rất tốt! Tiếp tục phát huy nhé! (Sehr gut! 👏)", en: "Very good! Keep it up! (Sehr gut! 👏)" },
    "grammar.praise.ok":    { vi: "Khá tốt! Ôn lại những câu sai rồi thử lại.", en: "Not bad! Review the wrong answers and try again." },
    "grammar.praise.low":   { vi: "Hãy xem lại lý thuyết và thử lại nhé!", en: "Review the theory and try again!" },
    "grammar.unansweredNote": { vi: "⚠️ {n} câu bạn chưa trả lời.", en: "⚠️ {n} questions left unanswered." },
    "grammar.alreadyChecked": { vi: "⚠️ Bạn đã kiểm tra rồi! Bấm 'Lưu & Hoàn thành' hoặc 'Làm lại' để tiếp tục.", en: "⚠️ Already checked! Press 'Save & finish' or 'Try again' to continue." },
    "grammar.saved":        { vi: "🎉 Đã lưu! Bạn nhận được +{points} điểm{coins}.", en: "🎉 Saved! You earned +{points} points{coins}." },
    "grammar.coinsSuffix":  { vi: " và +{coins} xu", en: " and +{coins} coins" },
    "grammar.retry":        { vi: "Làm lại bài ↺", en: "Try again ↺" },
    "grammar.loading":      { vi: "Đang tải câu hỏi...", en: "Loading questions…" },
    "grammar.noTheory":     { vi: "📝 Nội dung lý thuyết đang được cập nhật cho bài học này.", en: "📝 Theory for this lesson is being written." },
    "grammar.noQuestions":  { vi: "🚧 Bài học này chưa có câu hỏi. Dữ liệu đang được bổ sung.", en: "🚧 This lesson has no questions yet." },
    "grammar.jumpPractice": { vi: "Đến bài tập ngay →", en: "Go to exercises →" },
    "grammar.practiceNow":  { vi: "Luyện tập bài tập này ngay →", en: "Practise this lesson now →" },
    "grammar.loadError.title": { vi: "Không thể tải câu hỏi", en: "Could not load questions" },
    "grammar.loadError.text": { vi: "Kiểm tra console để biết chi tiết.", en: "Check the console for details." },
    "lesson.back":          { vi: "← Quay lại danh sách bài", en: "← Back to lesson list" },
    "lesson.tab.theory":    { vi: "📖 1. Lý thuyết", en: "📖 1. Theory" },
    "lesson.tab.practice":  { vi: "✍️ 2. Bài tập", en: "✍️ 2. Exercises" },
    "lesson.check":         { vi: "Kiểm tra đáp án & Xem giải thích", en: "Check answers & explanations" },
    "lesson.save":          { vi: "Lưu kết quả & Hoàn thành ✓", en: "Save result & finish ✓" },

    /* ----------------------------------------------------------- vocabulary */
    "vocab.loading":        { vi: "⏳ Đang tải module từ vựng...", en: "⏳ Loading vocabulary…" },
    "vocab.loadingData":    { vi: "Đang tải dữ liệu từ vựng...", en: "Loading vocabulary data…" },
    "vocab.stat.known":     { vi: "từ đã thuộc", en: "words known" },
    "vocab.stat.learning":  { vi: "đang ôn", en: "in review" },
    "vocab.stat.total":     { vi: "tổng từ A1", en: "A1 words" },
    "vocab.stat.coins":     { vi: "xu", en: "coins" },
    "vocab.all":            { vi: "Tất cả ({n})", en: "All ({n})" },
    "vocab.searchPlaceholder": { vi: "🔍 Tìm từ tiếng Đức hoặc nghĩa tiếng Việt...", en: "🔍 Search German word or Vietnamese meaning…" },
    "vocab.mode.flashcard": { vi: "🃏 Flashcard", en: "🃏 Flashcards" },
    "vocab.mode.list":      { vi: "📋 Danh sách", en: "📋 List" },
    "vocab.mode.review":    { vi: "🔔 Ôn hôm nay ({n})", en: "🔔 Due today ({n})" },
    "vocab.empty.noDue":    { vi: "Hôm nay không còn từ nào đến hạn ôn. Quay lại ngày mai nhé!", en: "No words are due today. Come back tomorrow!" },
    "vocab.card.progress":  { vi: "Thẻ <strong>{index}</strong> / {total}", en: "Card <strong>{index}</strong> / {total}" },
    "vocab.card.theme":     { vi: "Chủ đề: {theme}", en: "Topic: {theme}" },
    "vocab.status.known":   { vi: "Đã thuộc ✓", en: "Known ✓" },
    "vocab.status.learning": { vi: "Đang ôn ↻", en: "In review ↻" },
    "vocab.status.new":     { vi: "Chưa học", en: "New" },
    "vocab.front.hint":     { vi: "Bấm để xem nghĩa →", en: "Tap to see the meaning →" },
    "vocab.plural":         { vi: "Số nhiều: {value}", en: "Plural: {value}" },
    "vocab.pronunciation":  { vi: "Phát âm gần đúng:", en: "Approximate pronunciation:" },
    "vocab.prev":           { vi: "← Thẻ trước", en: "← Previous" },
    "vocab.next":           { vi: "Thẻ tiếp →", en: "Next →" },
    "vocab.wrong":          { vi: "✗ Chưa nhớ", en: "✗ Not yet" },
    "vocab.correct":        { vi: "✓ Đã nhớ!", en: "✓ Got it!" },
    "vocab.table.word":     { vi: "Từ tiếng Đức", en: "German word" },
    "vocab.table.type":     { vi: "Loại từ", en: "Type" },
    "vocab.table.article":  { vi: "Mạo từ", en: "Article" },
    "vocab.table.plural":   { vi: "Số nhiều", en: "Plural" },
    "vocab.table.meaning":  { vi: "Nghĩa tiếng Việt", en: "Vietnamese meaning" },
    "vocab.table.example":  { vi: "Câu ví dụ", en: "Example" },
    "vocab.table.status":   { vi: "Trạng thái", en: "Status" },
    "vocab.empty.noMatch":  { vi: "Không tìm thấy từ nào khớp với \"{query}\"", en: "No words match \"{query}\"" },
    "vocab.empty.noTheme":  { vi: "Không có từ vựng nào cho chủ đề này", en: "No words in this topic" },
    "vocab.empty.generic":  { vi: "Không có từ vựng nào phù hợp", en: "No matching words" },
    "vocab.done.title":     { vi: "Xong rồi! Bạn đã ôn hết {n} thẻ trong bộ này!", en: "Done! You reviewed all {n} cards in this set!" },
    "vocab.done.text":      { vi: "Hãy nghỉ ngắn rồi ôn lại những từ chưa nhớ.", en: "Take a short break, then review the words you missed." },
    "vocab.restart":        { vi: "Bắt đầu lại từ đầu", en: "Start over" },
    "vocab.error.title":    { vi: "Không thể tải dữ liệu từ vựng", en: "Could not load vocabulary data" },
    "vocab.error.data":     { vi: "Dữ liệu từ vựng có lỗi", en: "Vocabulary data is invalid" },
    "vocab.error.hint":     { vi: "Hãy chạy <strong>start.bat</strong> (hoặc <code>npm run serve</code>) rồi mở <strong>http://localhost:8080</strong>.", en: "Run <strong>start.bat</strong> (or <code>npm run serve</code>) and open <strong>http://localhost:8080</strong>." },
    "vocab.type.noun":      { vi: "Danh từ", en: "Noun" },
    "vocab.type.verb":      { vi: "Động từ", en: "Verb" },
    "vocab.type.adjective": { vi: "Tính từ", en: "Adjective" },
    "vocab.type.adverb":    { vi: "Trạng từ", en: "Adverb" },
    "vocab.type.exclamation": { vi: "Thán từ", en: "Interjection" },
    "vocab.type.conjunction": { vi: "Liên từ", en: "Conjunction" },
    "vocab.type.preposition": { vi: "Giới từ", en: "Preposition" },

    /* ------------------------------------------------------------- thông báo */
    "toast.reset":          { vi: "🔄 Đã reset toàn bộ dữ liệu cá nhân về ban đầu.", en: "🔄 All personal data has been reset." },
    "toast.memorized":      { vi: "✓ Đã thuộc từ này!", en: "✓ Marked as known!" },
    "toast.memorizedCoins": { vi: "✓ Đã thuộc từ này! +{coins} xu", en: "✓ Marked as known! +{coins} coins" },
    "toast.notRemembered":  { vi: "↻ Chưa nhớ — từ này sẽ lặp lại (không có xu).", en: "↻ Not yet — this word will repeat (no coins)." },
    "toast.levelLocked":    { vi: "🔒 Trình độ này đang khóa — bật 'Xem trước' ở chân sidebar để mở.", en: "🔒 This level is locked — enable 'Preview' at the bottom of the sidebar." },
    "toast.previewOn":      { vi: "👁️ Đã mở khóa toàn bộ để xem trước.", en: "👁️ Everything is unlocked for preview." },
    "toast.previewOff":     { vi: "🔒 Đã khóa lại các tính năng chưa hoàn thiện.", en: "🔒 Unfinished features are locked again." },
    "toast.previewLocked":  { vi: "🔒 Tính năng chưa mở. Bật 'Xem trước' ở chân sidebar.", en: "🔒 Feature locked. Enable 'Preview' at the bottom of the sidebar." },
    "toast.cloudSaved":     { vi: "☁️ Đã lưu cấu hình — đang kiểm tra kết nối…", en: "☁️ Configuration saved — checking connection…" },
    "toast.cloudDisconnected": { vi: "Đã ngắt đồng bộ đám mây.", en: "Cloud sync disconnected." },
    "confirm.reset":        { vi: "⚠️ Thao tác này sẽ XÓA TOÀN BỘ dữ liệu học tập cá nhân của bạn (điểm, streak, tiến độ bài, từ vựng, lỗi sai).\n\nDữ liệu bài học (lý thuyết, câu hỏi) KHÔNG bị xóa.\n\nBạn có chắc chắn muốn reset?", en: "⚠️ This will DELETE ALL your personal learning data (points, streak, lesson progress, vocabulary, mistakes).\n\nLesson content (theory, questions) is NOT deleted.\n\nAre you sure you want to reset?" },

    /* ---------------------------------------------------------------- cloud */
    "cloud.title":          { vi: "☁️ Đồng bộ đám mây", en: "☁️ Cloud sync" },
    "cloud.help":           { vi: "Sao lưu dữ liệu học tập lên Cloudflare Workers + D1 (miễn phí). Xem hướng dẫn tạo trong CLOUDFLARE.md.", en: "Back up your learning data to Cloudflare Workers + D1 (free). See CLOUDFLARE.md for setup." },
    "cloud.apiUrl":         { vi: "API URL", en: "API URL" },
    "cloud.token":          { vi: "Token", en: "Token" },
    "cloud.status.off":     { vi: "Chưa kết nối", en: "Not connected" },
    "cloud.status.idle":    { vi: "Sẵn sàng đồng bộ", en: "Ready to sync" },
    "cloud.status.syncing": { vi: "Đang đồng bộ…", en: "Syncing…" },
    "cloud.status.synced":  { vi: "Đã đồng bộ", en: "Synced" },
    "cloud.status.offline": { vi: "Không có mạng", en: "Offline" },
    "cloud.status.error":   { vi: "Lỗi đồng bộ", en: "Sync error" },
    "cloud.disconnect":     { vi: "Ngắt kết nối", en: "Disconnect" },
    "cloud.pull":           { vi: "Tải từ cloud", en: "Pull from cloud" },
    "cloud.push":           { vi: "Đẩy lên ngay", en: "Push now" },
    "cloud.save":           { vi: "Lưu & kết nối", en: "Save & connect" },
    "cloud.close":          { vi: "Đóng", en: "Close" },
    "cloud.invalid":        { vi: "URL phải bắt đầu bằng https:// (hoặc http://localhost) và token tối thiểu 8 ký tự.", en: "The URL must start with https:// (or http://localhost) and the token needs at least 8 characters." },
    "cloud.confirmPull":    { vi: "Bản trên cloud mới hơn bản trên máy.\n\nTải bản cloud về và thay thế dữ liệu hiện tại?", en: "The cloud copy is newer than this device.\n\nDownload it and replace the current data?" },
    "cloud.err.token":      { vi: "Token không đúng", en: "Invalid token" },
    "cloud.err.status":     { vi: "Máy chủ trả {status}", en: "Server returned {status}" },
    "cloud.err.timeout":    { vi: "Hết thời gian chờ", en: "Request timed out" },
    "cloud.err.network":    { vi: "Không kết nối được máy chủ", en: "Cannot reach the server" },
    "cloud.pulled":         { vi: "Đã tải từ cloud", en: "Downloaded from cloud" },

    /* -------------------------------------------------------------- preview */
    "preview.badge":        { vi: "Xem trước · chưa hoạt động", en: "Preview · not active yet" },
    "preview.nav.title":    { vi: "Xem trước giao diện — tính năng chưa hoạt động", en: "UI preview — feature not active yet" },

    /* --------------------------------------------- nội dung 5 trang xem trước */
    "preview.hoeren.title":   { vi: "Luyện nghe (Hören)", en: "Listening (Hören)" },
    "preview.hoeren.tagline": { vi: "Nghe hiểu và bắt chước phát âm — kỹ năng nên luyện sớm nhất khi học tiếng Đức.", en: "Listening comprehension and pronunciation practice — start early when learning German." },
    "preview.hoeren.p1":      { vi: "Đoạn nghe ngắn theo cấp độ A1 → B2, kèm transcript", en: "Short listening clips from A1 to B2 with transcripts" },
    "preview.hoeren.p2":      { vi: "Câu hỏi trắc nghiệm sau mỗi đoạn", en: "Multiple-choice questions after each clip" },
    "preview.hoeren.p3":      { vi: "Nghe lại từng câu, điều chỉnh tốc độ", en: "Replay sentence by sentence and adjust speed" },
    "preview.hoeren.p4":      { vi: "Kết quả tự lưu vào sổ tay lỗi sai", en: "Results are saved to the mistake notebook" },
    "preview.hoeren.note":    { vi: "Cần file âm thanh hoặc giọng đọc của trình duyệt — sẽ làm sau khi có nội dung.", en: "Needs audio files or browser speech — planned once content is ready." },

    "preview.lesen.title":    { vi: "Đọc hiểu (Lesen)", en: "Reading (Lesen)" },
    "preview.lesen.tagline":  { vi: "Đọc đoạn văn ngắn rồi trả lời câu hỏi — tăng vốn từ theo ngữ cảnh.", en: "Read short passages and answer questions — build vocabulary in context." },
    "preview.lesen.p1":       { vi: "Đoạn văn A1–B2 theo chủ đề đời sống", en: "A1–B2 passages on everyday topics" },
    "preview.lesen.p2":       { vi: "Câu hỏi đúng/sai, trắc nghiệm, nối cặp", en: "True/false, multiple choice and matching questions" },
    "preview.lesen.p3":       { vi: "Tra từ ngay trong bài (nhấp vào từ)", en: "Look up words in place (tap a word)" },
    "preview.lesen.p4":       { vi: "Thống kê tốc độ đọc và độ chính xác", en: "Reading speed and accuracy statistics" },
    "preview.lesen.note":     { vi: "Nội dung sẽ lấy từ bộ từ vựng sẵn có để tránh từ mới quá tải.", en: "Content will use the existing word list to avoid overloading learners." },

    "preview.schreiben.title":   { vi: "Luyện viết (Schreiben)", en: "Writing (Schreiben)" },
    "preview.schreiben.tagline": { vi: "Viết câu và đoạn ngắn, nhận gợi ý sửa lỗi ngữ pháp.", en: "Write sentences and short paragraphs with grammar correction hints." },
    "preview.schreiben.p1":      { vi: "Đề bài theo chủ đề và cấp độ", en: "Prompts by topic and level" },
    "preview.schreiben.p2":      { vi: "Gợi ý từ vựng và mẫu câu", en: "Vocabulary and sentence-pattern hints" },
    "preview.schreiben.p3":      { vi: "Đối chiếu với bài mẫu", en: "Compare with a model answer" },
    "preview.schreiben.p4":      { vi: "Lưu bài viết để xem lại tiến bộ", en: "Save drafts to track progress" },
    "preview.schreiben.note":    { vi: "Bản đầu tiên có thể chỉ chấm theo từ khóa và mẫu câu, chưa cần AI.", en: "The first version can check keywords and patterns without AI." },

    "preview.mistakes.title":   { vi: "Sổ tay lỗi sai", en: "Mistake notebook" },
    "preview.mistakes.tagline": { vi: "Mọi câu làm sai đã được lưu lại từ trước — trang này sẽ giúp ôn đúng chỗ yếu.", en: "Every missed answer is already saved — this page will help you review weak spots." },
    "preview.mistakes.p1":      { vi: "Xem toàn bộ lỗi sai và đáp án đúng", en: "See every mistake and the correct answer" },
    "preview.mistakes.p2":      { vi: "Đánh dấu \"đã hiểu\" để dọn dần", en: "Mark as understood to clear them over time" },
    "preview.mistakes.p3":      { vi: "Ôn lại theo chủ đề hoặc theo bài", en: "Review by topic or by lesson" },
    "preview.mistakes.p4":      { vi: "Không kiếm xu khi ôn lỗi sai (đúng luật hiện tại)", en: "No coins when reviewing mistakes (current rule)" },
    "preview.mistakes.note":    { vi: "Dữ liệu lỗi sai đã có sẵn trong localStorage, chỉ còn thiếu giao diện.", en: "Mistake data already exists in localStorage — only the UI is missing." },

    "preview.ai.title":   { vi: "Trợ lý AI", en: "AI tutor" },
    "preview.ai.tagline": { vi: "Giải thích lỗi sai, gợi ý cách diễn đạt, luyện hội thoại.", en: "Explain mistakes, suggest phrasing and practise conversation." },
    "preview.ai.p1":      { vi: "Hỏi đáp ngữ pháp dựa trên bài đang học", en: "Grammar Q&A based on the current lesson" },
    "preview.ai.p2":      { vi: "Giải thích vì sao câu trả lời sai", en: "Explain why an answer is wrong" },
    "preview.ai.p3":      { vi: "Luyện hội thoại theo tình huống", en: "Practise conversation scenarios" },
    "preview.ai.p4":      { vi: "Tóm tắt lỗi sai lặp lại của riêng bạn", en: "Summarise your recurring mistakes" },
    "preview.ai.note":    { vi: "Cần backend giữ API key (Cloudflare Worker có thể đảm nhiệm) — chưa nằm trong giai đoạn này.", en: "Needs a backend to hold the API key (a Cloudflare Worker could) — not in this phase." },
    "preview.back":         { vi: "← Về tổng quan", en: "← Back to overview" },
    "preview.stats.mistakes": { vi: "lỗi đã ghi", en: "mistakes recorded" },
    "preview.stats.pending":  { vi: "chưa ôn lại", en: "not reviewed" },

    /* -------------------------------------------------- kiểm tra trình độ */
    "placement.title":        { vi: "Kiểm tra xếp trình độ A1", en: "A1 level test" },
    "placement.intro":        { vi: "{n} câu hỏi trải đều các chủ đề A1. Kết quả chỉ để gợi ý lộ trình — không tính điểm hay xu.", en: "{n} questions across A1 topics. The result only suggests a starting point — no points or coins." },
    "placement.submit":       { vi: "Nộp bài & xem kết quả", en: "Submit & see result" },
    "placement.result":       { vi: "Kết quả: {correct}/{total} câu đúng", en: "Result: {correct}/{total} correct" },
    "placement.unanswered":   { vi: "{n} câu chưa trả lời.", en: "{n} questions unanswered." },
    "placement.band.strong":  { vi: "Nền tảng tốt — bạn có thể học nhanh hơn lộ trình chuẩn.", en: "Solid foundation — you can move faster than the standard path." },
    "placement.band.learning": { vi: "Bạn đang ở mức A1 — học đều từ bài đầu sẽ chắc nhất.", en: "You're at A1 — working steadily from the first lesson is safest." },
    "placement.band.starting": { vi: "Hãy bắt đầu từ bài đầu tiên để xây nền thật chắc.", en: "Start from the first lesson to build a strong foundation." },
    "placement.goGrammar":    { vi: "Vào phần Ngữ pháp", en: "Go to Grammar" },
    "placement.retake":       { vi: "Làm lại bài kiểm tra", en: "Retake the test" },
    "placement.loading":      { vi: "Đang tải bài kiểm tra...", en: "Loading the test…" },
    "placement.error":        { vi: "Không tải được bài kiểm tra. Hãy chạy start.bat rồi thử lại.", en: "Could not load the test. Run start.bat and try again." },
    "placement.lastResult":   { vi: "Lần kiểm tra gần nhất: {correct}/{total} ({date})", en: "Last test: {correct}/{total} ({date})" },

    /* ------------------------------------------------------- lộ trình */
    "plan.title":            { vi: "🗺️ Lộ trình của bạn", en: "🗺️ Your study plan" },
    "plan.progress":         { vi: "{done}/{total} bài", en: "{done}/{total} lessons" },
    "plan.placement":        { vi: "Trình độ gợi ý: A1 · {score}/{total} câu đúng", en: "Suggested level: A1 · {score}/{total} correct" },
    "plan.noPlacement":      { vi: "Chưa có kết quả xếp trình độ.", en: "No level test yet." },
    "plan.checkPlacement":   { vi: "Kiểm tra ngay", en: "Take it now" },
    "plan.next":             { vi: "Bài tiếp theo", en: "Next lesson" },
    "plan.start":            { vi: "Học ngay", en: "Start" },
    "plan.allDone":          { vi: "Bạn đã hoàn thành toàn bộ A1 🎉", en: "You finished all A1 lessons 🎉" },
    "plan.reviewLabel":      { vi: "Cần ôn hôm nay", en: "Due today" },
    "plan.dueWords":         { vi: "{n} từ đến hạn", en: "{n} words due" },
    "plan.review":           { vi: "Ôn ngay", en: "Review" },
    "plan.state.available":  { vi: "Đang học", en: "Current" },
    "plan.state.open":       { vi: "Sẵn sàng", en: "Ready" },
    "plan.state.locked":     { vi: "Cần học trước", en: "Locked" },

    /* ------------------------------------------------- sổ tay lỗi sai */
    "mistakes.empty":        { vi: "Chưa có lỗi sai nào. Khi làm bài sai, lỗi sẽ xuất hiện ở đây.", en: "No mistakes yet. Wrong answers will show up here." },
    "mistakes.total":        { vi: "Tổng: {n}", en: "Total: {n}" },
    "mistakes.open":         { vi: "Chưa ôn: {n}", en: "Not reviewed: {n}" },
    "mistakes.filterAll":    { vi: "Tất cả ({n})", en: "All ({n})" },
    "mistakes.yourAnswer":   { vi: "Bạn chọn:", en: "Your answer:" },
    "mistakes.correctAnswer": { vi: "Đáp án đúng:", en: "Correct answer:" },
    "mistakes.markUnderstood": { vi: "Đánh dấu đã hiểu", en: "Mark as understood" },
    "mistakes.understood":   { vi: "✓ Đã hiểu", en: "✓ Understood" },
    "mistakes.clearUnderstood": { vi: "Xoá lỗi đã hiểu ({n})", en: "Clear understood ({n})" },
    "mistakes.marked":       { vi: "Đã đánh dấu lỗi là đã hiểu.", en: "Mistake marked as understood." },
    "mistakes.cleared":      { vi: "Đã xoá {n} lỗi đã hiểu.", en: "Removed {n} understood mistakes." },

    /* ---------------------------------------------------- game tìm lỗi */
    "game.start":            { vi: "🎮 Chơi: Tìm lỗi", en: "🎮 Play: find the mistake" },
    "game.title":            { vi: "🕵️ Tìm lỗi sai", en: "🕵️ Find the mistake" },
    "game.intro":            { vi: "Câu đã được điền sẵn. Chọn Đúng nếu chính xác, Sai nếu chưa.", en: "The sentence is already filled in. Choose Correct or Wrong." },
    "game.true":             { vi: "✔ Đúng", en: "✔ Correct" },
    "game.false":            { vi: "✘ Sai", en: "✘ Wrong" },
    "game.correct":          { vi: "Chính xác!", en: "Correct!" },
    "game.wrong":            { vi: "Chưa đúng — đáp án đúng là: {answer}", en: "Not quite — the correct answer is: {answer}" },
    "game.next":             { vi: "Câu tiếp →", en: "Next →" },
    "game.result":           { vi: "Kết quả: {correct}/{total}", en: "Result: {correct}/{total}" },
    "game.retry":            { vi: "Chơi lại", en: "Play again" },
    "game.back":             { vi: "Về sổ tay", en: "Back to notebook" },
    "game.needData":         { vi: "Cần ít nhất một lỗi đã ghi để chơi.", en: "You need at least one recorded mistake to play." },
  };

  let lang = readLang();

  function readLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(saved) ? saved : "vi";
    } catch (err) {
      return "vi";
    }
  }

  function getLang() {
    return lang;
  }

  /** Dịch một khoá, thay {placeholder} nếu có */
  function t(key, params) {
    const entry = DICT[key];
    if (!entry) {
      console.warn("[i18n] Thiếu khoá:", key);
      return key;
    }
    let text = entry[lang] || entry.vi;
    if (params) {
      Object.keys(params).forEach((name) => {
        text = text.split(`{${name}}`).join(String(params[name]));
      });
    }
    return text;
  }

  /** Áp dụng cho mọi phần tử có data-i18n* trong phạm vi root */
  function apply(root) {
    const scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });

    scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });

    scope.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    // Cho phép thẻ HTML đơn giản trong chuỗi dịch (vd: <strong>, <code>)
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    document.documentElement.lang = lang;
  }

  function setLang(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      console.warn("[i18n] Không lưu được lựa chọn ngôn ngữ:", err.message);
    }
    apply();
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { lang: lang } }));
  }

  function toggle() {
    setLang(lang === "vi" ? "en" : "vi");
    return lang;
  }

  function init() {
    apply();
  }

  return { t, apply, setLang, getLang, toggle, init, SUPPORTED, STORAGE_KEY };
})();

if (typeof window !== "undefined") {
  window.I18N = I18N;
  window.t = I18N.t;
}
