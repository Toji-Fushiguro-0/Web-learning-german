// data/embedded-data.js — TỰ SINH, ĐỪNG SỬA TAY.
// Nguồn: data/grammar.json + data/vocabulary.json + data/placement.json.
// Sinh lại bằng: npm run build:data
// Dùng làm phương án dự phòng khi fetch() bị chặn (mở file:// trực tiếp).
window.EMBEDDED_DATA = {
  "generatedAt": "2026-10-24T15:32:12.122Z",
  "grammar": {
    "meta": {
      "version": "1.0",
      "level": "A1",
      "totalQuestions": 30,
      "description": "Bộ câu hỏi ngữ pháp tiếng Đức trình độ A1"
    },
    "questions": [
      {
        "id": "g-a1-001",
        "level": "A1",
        "topic": "sein-haben",
        "topicLabel": "Động từ sein và haben",
        "question": "Điền dạng đúng của động từ vào chỗ trống: \"Ich ______ Student.\"",
        "questionType": "fill-blank",
        "options": [
          "bin",
          "bist",
          "ist",
          "sind"
        ],
        "correctIndex": 0,
        "explanation": "Chủ ngữ 'ich' (ngôi thứ nhất số ít) đi với 'bin' của động từ sein. Câu có nghĩa: Tôi là sinh viên.",
        "exampleExtra": "Ich bin müde. (Tôi mệt.) / Ich bin aus Vietnam. (Tôi đến từ Việt Nam.)",
        "points": 10
      },
      {
        "id": "g-a1-002",
        "level": "A1",
        "topic": "sein-haben",
        "topicLabel": "Động từ sein và haben",
        "question": "Chọn từ đúng để hoàn thành câu: \"______ du Zeit für einen Kaffee?\" (Bạn có thời gian uống cà phê không?)",
        "questionType": "fill-blank",
        "options": [
          "Bist",
          "Hast",
          "Hat",
          "Habt"
        ],
        "correctIndex": 1,
        "explanation": "'Zeit haben' (có thời gian) dùng động từ 'haben'. Chủ ngữ 'du' đi với 'hast'. Câu hỏi Ja/Nein: động từ đứng đầu → 'Hast du Zeit?'",
        "exampleExtra": "Hast du Hunger? (Bạn có đói không?)",
        "points": 10
      },
      {
        "id": "g-a1-003",
        "level": "A1",
        "topic": "sein-haben",
        "topicLabel": "Động từ sein và haben",
        "question": "Điền vào chỗ trống: \"Wir ______ großen Hunger.\" (Chúng tôi rất đói.)",
        "questionType": "fill-blank",
        "options": [
          "sind",
          "seid",
          "haben",
          "habt"
        ],
        "correctIndex": 2,
        "explanation": "'Hunger haben' là cụm cố định nghĩa là 'cảm thấy đói'. Chủ ngữ 'wir' đi với 'haben'. Không dùng 'sind' vì đói là cảm giác, không phải trạng thái hay danh tính.",
        "exampleExtra": "Wir haben Durst. (Chúng tôi khát nước.)",
        "points": 10
      },
      {
        "id": "g-a1-004",
        "level": "A1",
        "topic": "sein-haben",
        "topicLabel": "Động từ sein và haben",
        "question": "Câu nào đúng ngữ pháp? (Cô ấy có một con mèo.)",
        "questionType": "choose-correct",
        "options": [
          "Sie hast eine Katze.",
          "Sie hat eine Katze.",
          "Sie ist eine Katze.",
          "Sie habt eine Katze."
        ],
        "correctIndex": 1,
        "explanation": "Chủ ngữ 'sie' (ngôi thứ ba số ít) đi với 'hat' của động từ 'haben'. 'hast' là của 'du', 'habt' là của 'ihr'. Dùng 'haben' vì nói về việc sở hữu (có mèo).",
        "points": 10
      },
      {
        "id": "g-a1-005",
        "level": "A1",
        "topic": "sein-haben",
        "topicLabel": "Động từ sein và haben",
        "question": "Tìm lỗi sai: \"Wo seid ihr gerade?\" → Câu này đúng hay sai?",
        "questionType": "choose-correct",
        "options": [
          "Đúng — 'seid' là dạng đúng cho 'ihr'",
          "Sai — phải là 'Wo sind ihr'",
          "Sai — phải là 'Wo habt ihr'",
          "Sai — phải là 'Wo bist ihr'"
        ],
        "correctIndex": 0,
        "explanation": "Câu 'Wo seid ihr?' hoàn toàn đúng. 'ihr' (ngôi thứ hai số nhiều) đi với 'seid' của động từ 'sein'. Câu hỏi về địa điểm dùng 'sein', không phải 'haben'.",
        "points": 10
      },
      {
        "id": "g-a1-006",
        "level": "A1",
        "topic": "regular-verbs",
        "topicLabel": "Chia động từ thường",
        "question": "Chia đúng động từ 'spielen' (chơi) cho ngôi 'er': \"Er ______ Fußball.\"",
        "questionType": "fill-blank",
        "options": [
          "spielen",
          "spielst",
          "spielt",
          "spiele"
        ],
        "correctIndex": 2,
        "explanation": "Gốc động từ 'spielen' là 'spiel-'. Ngôi 'er/sie/es' thêm đuôi '-t' → spiel + t = 'spielt'. Câu có nghĩa: Anh ấy chơi bóng đá.",
        "exampleExtra": "Er spielt Gitarre. (Anh ấy chơi đàn ghi-ta.)",
        "points": 10
      },
      {
        "id": "g-a1-007",
        "level": "A1",
        "topic": "regular-verbs",
        "topicLabel": "Chia động từ thường",
        "question": "Điền dạng đúng: \"Du ______ sehr viel.\" (Bạn học rất nhiều.) — Động từ: lernen",
        "questionType": "fill-blank",
        "options": [
          "lerne",
          "lernst",
          "lernt",
          "lernen"
        ],
        "correctIndex": 1,
        "explanation": "Gốc động từ 'lernen' là 'lern-'. Ngôi 'du' thêm đuôi '-st' → lern + st = 'lernst'.",
        "points": 10
      },
      {
        "id": "g-a1-008",
        "level": "A1",
        "topic": "regular-verbs",
        "topicLabel": "Chia động từ thường",
        "question": "Chia động từ 'arbeiten' (làm việc) cho ngôi 'sie' (họ): \"Sie ______ viel.\"",
        "questionType": "fill-blank",
        "options": [
          "arbeitest",
          "arbeitet",
          "arbeiten",
          "arbeitst"
        ],
        "correctIndex": 2,
        "explanation": "Ngôi 'sie' (số nhiều) giống như 'wir' — thêm '-en' vào gốc: arbeit + en = 'arbeiten'. Đây là trường hợp đặc biệt vì gốc kết thúc bằng '-t', nhưng với ngôi 'sie' (họ) vẫn thêm '-en' bình thường.",
        "exampleExtra": "Sie arbeiten in einer Fabrik. (Họ làm việc trong một nhà máy.)",
        "points": 10
      },
      {
        "id": "g-a1-009",
        "level": "A1",
        "topic": "regular-verbs",
        "topicLabel": "Chia động từ thường",
        "question": "Câu nào chia đúng động từ 'wohnen' (ở, sống)? — Chủ ngữ: ich",
        "questionType": "choose-correct",
        "options": [
          "Ich wohnst in Hamburg.",
          "Ich wohnt in Hamburg.",
          "Ich wohnen in Hamburg.",
          "Ich wohne in Hamburg."
        ],
        "correctIndex": 3,
        "explanation": "Ngôi 'ich' luôn thêm đuôi '-e': wohn + e = 'wohne'. Chỉ ngôi 'du' mới dùng '-st', 'er/sie/es' và 'ihr' dùng '-t'.",
        "points": 10
      },
      {
        "id": "g-a1-010",
        "level": "A1",
        "topic": "regular-verbs",
        "topicLabel": "Chia động từ thường",
        "question": "Điền đúng: \"______ ihr Deutsch?\" (Các bạn có học tiếng Đức không?) — Động từ: lernen",
        "questionType": "fill-blank",
        "options": [
          "Lernst",
          "Lerne",
          "Lernt",
          "Lernen"
        ],
        "correctIndex": 2,
        "explanation": "Ngôi 'ihr' (ngôi thứ hai số nhiều — 'các bạn') thêm đuôi '-t': lern + t = 'Lernt'. Đây là câu hỏi Ja/Nein nên động từ đứng đầu câu, viết hoa.",
        "points": 10
      },
      {
        "id": "g-a1-011",
        "level": "A1",
        "topic": "pronouns",
        "topicLabel": "Đại từ nhân xưng",
        "question": "Thay thế danh từ bằng đại từ: \"Der Mann heißt Thomas.\" → \"______ heißt Thomas.\"",
        "questionType": "fill-blank",
        "options": [
          "Sie",
          "Es",
          "Er",
          "Wir"
        ],
        "correctIndex": 2,
        "explanation": "'der Mann' (người đàn ông) là danh từ giống đực (maskulin), nên thay thế bằng đại từ 'er' (anh ấy/ông ấy).",
        "points": 10
      },
      {
        "id": "g-a1-012",
        "level": "A1",
        "topic": "pronouns",
        "topicLabel": "Đại từ nhân xưng",
        "question": "Đại từ nào phù hợp thay cho 'das Buch' (cuốn sách) trong câu \"______ ist sehr interessant\"?",
        "questionType": "fill-blank",
        "options": [
          "Er",
          "Sie",
          "Es",
          "Ihr"
        ],
        "correctIndex": 2,
        "explanation": "'das Buch' có giống trung (neutral), nên thay thế bằng đại từ 'es' (nó). Quy tắc: der → er, die → sie, das → es.",
        "points": 10
      },
      {
        "id": "g-a1-013",
        "level": "A1",
        "topic": "pronouns",
        "topicLabel": "Đại từ nhân xưng",
        "question": "Khi nói lịch sự với người lớn tuổi hoặc người xa lạ, bạn dùng đại từ nào?",
        "questionType": "choose-correct",
        "options": [
          "du (viết thường)",
          "ihr",
          "Sie (viết hoa S)",
          "sie (viết thường)"
        ],
        "correctIndex": 2,
        "explanation": "'Sie' (viết hoa chữ S) là đại từ kính ngữ dùng trong giao tiếp trang trọng. 'du' dùng với bạn bè, người thân. 'sie' (thường) nghĩa là 'cô ấy/họ', 'ihr' là 'các bạn'.",
        "points": 10
      },
      {
        "id": "g-a1-014",
        "level": "A1",
        "topic": "pronouns",
        "topicLabel": "Đại từ nhân xưng",
        "question": "\"Die Kinder spielen im Garten.\" (Bọn trẻ chơi trong vườn.) → Thay 'Die Kinder' bằng đại từ phù hợp:",
        "questionType": "fill-blank",
        "options": [
          "Er",
          "Sie",
          "Es",
          "Du"
        ],
        "correctIndex": 1,
        "explanation": "'Die Kinder' là danh từ số nhiều. Đại từ thay thế cho số nhiều là 'sie' (họ). Lưu ý: 'sie' (thường) = cô ấy/họ; 'Sie' (hoa) = Ngài (kính ngữ).",
        "points": 10
      },
      {
        "id": "g-a1-015",
        "level": "A1",
        "topic": "articles",
        "topicLabel": "Mạo từ der, die, das, ein, eine",
        "question": "Chọn mạo từ đúng: \"______ Buch ist neu.\" (Cuốn sách này mới.)",
        "questionType": "fill-blank",
        "options": [
          "Der",
          "Die",
          "Das",
          "Ein"
        ],
        "correctIndex": 2,
        "explanation": "'Buch' (sách) có giống trung (neutral), nên dùng mạo từ xác định 'das'. Câu dùng mạo từ xác định vì đang nói về một cuốn sách cụ thể.",
        "points": 10
      },
      {
        "id": "g-a1-016",
        "level": "A1",
        "topic": "articles",
        "topicLabel": "Mạo từ der, die, das, ein, eine",
        "question": "Điền mạo từ bất định phù hợp: \"Ich habe ______ Schwester.\" (Tôi có một người chị/em gái.)",
        "questionType": "fill-blank",
        "options": [
          "ein",
          "eine",
          "der",
          "die"
        ],
        "correctIndex": 1,
        "explanation": "'Schwester' (chị/em gái) có giống cái (feminin). Mạo từ bất định cho giống cái là 'eine'. Nhớ: ein (đực/trung) — eine (cái).",
        "points": 10
      },
      {
        "id": "g-a1-017",
        "level": "A1",
        "topic": "articles",
        "topicLabel": "Mạo từ der, die, das, ein, eine",
        "question": "Câu nào đúng? (Đó là một người đàn ông.)",
        "questionType": "choose-correct",
        "options": [
          "Das ist eine Mann.",
          "Das ist der Mann.",
          "Das ist ein Mann.",
          "Das ist einen Mann."
        ],
        "correctIndex": 2,
        "explanation": "'Mann' (đàn ông) có giống đực (maskulin). Khi giới thiệu lần đầu (chưa xác định), dùng mạo từ bất định 'ein' (đực/trung). Câu có nghĩa: Đó là một người đàn ông.",
        "points": 10
      },
      {
        "id": "g-a1-018",
        "level": "A1",
        "topic": "articles",
        "topicLabel": "Mạo từ der, die, das, ein, eine",
        "question": "Điền mạo từ xác định đúng: \"______ Mädchen spielt.\" (Cô bé đang chơi.)",
        "questionType": "fill-blank",
        "options": [
          "Der",
          "Die",
          "Das",
          "Ein"
        ],
        "correctIndex": 2,
        "explanation": "'Mädchen' (cô bé/con gái) có đuôi '-chen', tất cả từ có đuôi '-chen' và '-lein' đều là giống trung (neutral) → dùng 'das'. Đây là ngoại lệ quan trọng: dù chỉ người nữ nhưng vẫn là giống trung!",
        "points": 10
      },
      {
        "id": "g-a1-019",
        "level": "A1",
        "topic": "articles",
        "topicLabel": "Mạo từ der, die, das, ein, eine",
        "question": "Số nhiều của mọi danh từ tiếng Đức đều dùng mạo từ nào?",
        "questionType": "choose-correct",
        "options": [
          "der",
          "die",
          "das",
          "ein"
        ],
        "correctIndex": 1,
        "explanation": "Tất cả danh từ số nhiều, bất kể giống gốc là đực, cái hay trung, đều dùng mạo từ xác định 'die'. Ví dụ: der Mann → die Männer, die Frau → die Frauen, das Kind → die Kinder.",
        "points": 10
      },
      {
        "id": "g-a1-020",
        "level": "A1",
        "topic": "negation",
        "topicLabel": "Phủ định nicht và kein",
        "question": "Phủ định câu: \"Ich schlafe.\" (Tôi đang ngủ.) → Câu phủ định đúng là:",
        "questionType": "choose-correct",
        "options": [
          "Ich schlafe kein.",
          "Ich kein schlafe.",
          "Ich schlafe nicht.",
          "Ich nicht schlafe."
        ],
        "correctIndex": 2,
        "explanation": "Phủ định động từ thường bằng 'nicht'. 'nicht' đứng ở CUỐI câu (hoặc trước thành phần bổ trợ). Câu có nghĩa: Tôi không ngủ.",
        "points": 10
      },
      {
        "id": "g-a1-021",
        "level": "A1",
        "topic": "negation",
        "topicLabel": "Phủ định nicht và kein",
        "question": "Câu nào phủ định đúng: \"Ich habe eine Schwester.\" (Tôi có một người chị.)?",
        "questionType": "choose-correct",
        "options": [
          "Ich habe nicht eine Schwester.",
          "Ich habe keine Schwester.",
          "Ich habe kein Schwester.",
          "Ich keine habe Schwester."
        ],
        "correctIndex": 1,
        "explanation": "Khi phủ định danh từ đi với mạo từ bất định 'eine', ta thay 'eine' bằng 'keine' (không có). 'keine Schwester' vì 'Schwester' là giống cái. Không dùng 'nicht eine'.",
        "points": 10
      },
      {
        "id": "g-a1-022",
        "level": "A1",
        "topic": "negation",
        "topicLabel": "Phủ định nicht và kein",
        "question": "Điền vào chỗ trống: \"Das ist ______ Hund, das ist eine Katze.\" (Đó không phải là chó, đó là mèo.)",
        "questionType": "fill-blank",
        "options": [
          "nicht",
          "keine",
          "kein",
          "keinen"
        ],
        "correctIndex": 2,
        "explanation": "Phủ định danh từ 'Hund' (chó, giống đực — der Hund): thay 'ein' bằng 'kein' (giống đực/trung dùng 'kein', giống cái dùng 'keine'). 'das ist kein Hund' = đó không phải là chó.",
        "points": 10
      },
      {
        "id": "g-a1-023",
        "level": "A1",
        "topic": "negation",
        "topicLabel": "Phủ định nicht và kein",
        "question": "Khi nào dùng 'nicht' thay vì 'kein' để phủ định?",
        "questionType": "choose-correct",
        "options": [
          "Khi phủ định danh từ không có mạo từ",
          "Khi phủ định động từ, tính từ, hoặc danh từ có mạo từ xác định (der/die/das)",
          "Khi phủ định danh từ có mạo từ bất định (ein/eine)",
          "Luôn dùng 'nicht' thay vì 'kein'"
        ],
        "correctIndex": 1,
        "explanation": "Dùng 'nicht' để phủ định: (1) động từ (Ich schlafe nicht.), (2) tính từ (Das ist nicht gut.), (3) danh từ có mạo từ xác định (Ich kenne den Mann nicht.). Dùng 'kein' để phủ định danh từ có 'ein/eine' hoặc không có mạo từ.",
        "points": 10
      },
      {
        "id": "g-a1-024",
        "level": "A1",
        "topic": "questions",
        "topicLabel": "Câu hỏi W-Fragen và Ja/Nein",
        "question": "Câu hỏi nào hỏi về TÊN của người: \"______ heißt du?\"",
        "questionType": "fill-blank",
        "options": [
          "Wo",
          "Was",
          "Wie",
          "Wer"
        ],
        "correctIndex": 2,
        "explanation": "'Wie heißt du?' = Bạn tên là gì? (nghĩa đen: Bạn được gọi như thế nào?). 'Wie' hỏi về cách/phương thức. Đây là câu hỏi tiêu chuẩn để hỏi tên trong tiếng Đức.",
        "exampleExtra": "Wie heißen Sie? (Ngài tên là gì? — kính ngữ)",
        "points": 10
      },
      {
        "id": "g-a1-025",
        "level": "A1",
        "topic": "questions",
        "topicLabel": "Câu hỏi W-Fragen và Ja/Nein",
        "question": "Từ để hỏi nào dùng để hỏi về NGUỒN GỐC (bạn đến từ đâu)?",
        "questionType": "choose-correct",
        "options": [
          "Wo",
          "Woher",
          "Wohin",
          "Wann"
        ],
        "correctIndex": 1,
        "explanation": "'Woher kommst du?' = Bạn đến từ đâu? 'Wo' hỏi vị trí hiện tại (ở đâu), 'Woher' hỏi xuất xứ/nguồn gốc (từ đâu), 'Wohin' hỏi đích đến (đi đâu).",
        "exampleExtra": "Woher kommen Sie? — Ich komme aus Vietnam.",
        "points": 10
      },
      {
        "id": "g-a1-026",
        "level": "A1",
        "topic": "questions",
        "topicLabel": "Câu hỏi W-Fragen và Ja/Nein",
        "question": "Biến câu sau thành câu hỏi Ja/Nein: \"Du sprichst Deutsch.\" → Câu hỏi đúng là:",
        "questionType": "choose-correct",
        "options": [
          "Du sprichst Deutsch?",
          "Sprichst du Deutsch?",
          "Spricht du Deutsch?",
          "Deutsch sprichst du?"
        ],
        "correctIndex": 1,
        "explanation": "Câu hỏi Ja/Nein: đảo động từ lên đầu, chủ ngữ đứng sau. Câu khẳng định 'Du sprichst' → câu hỏi 'Sprichst du?'. Quy tắc: V1 (verb first) — S (subject) — rest.",
        "points": 10
      },
      {
        "id": "g-a1-027",
        "level": "A1",
        "topic": "questions",
        "topicLabel": "Câu hỏi W-Fragen và Ja/Nein",
        "question": "Câu hỏi \"Was machst du?\" có nghĩa là gì?",
        "questionType": "choose-correct",
        "options": [
          "Bạn tên là gì?",
          "Bạn ở đâu?",
          "Bạn đang làm gì?",
          "Bạn bao nhiêu tuổi?"
        ],
        "correctIndex": 2,
        "explanation": "'Was' = cái gì / điều gì. 'machen' = làm. 'Was machst du?' = Bạn đang làm gì? Câu trả lời ví dụ: 'Ich lerne Deutsch.' (Tôi đang học tiếng Đức.)",
        "points": 10
      },
      {
        "id": "g-a1-028",
        "level": "A1",
        "topic": "word-order",
        "topicLabel": "Trật tự từ cơ bản",
        "question": "Sắp xếp thành câu đúng: [heute / Ich / Deutsch / lerne]",
        "questionType": "choose-correct",
        "options": [
          "Heute lerne Deutsch ich.",
          "Ich lerne heute Deutsch.",
          "Ich heute lerne Deutsch.",
          "Deutsch lerne ich heute."
        ],
        "correctIndex": 1,
        "explanation": "Quy tắc cơ bản: Chủ ngữ — Động từ (vị trí 2) — các thành phần còn lại. 'Ich lerne heute Deutsch.' Động từ 'lerne' luôn ở vị trí thứ 2 trong câu khẳng định.",
        "points": 10
      },
      {
        "id": "g-a1-029",
        "level": "A1",
        "topic": "word-order",
        "topicLabel": "Trật tự từ cơ bản",
        "question": "Câu nào có trật tự từ ĐÚNG khi bắt đầu bằng trạng từ thời gian? \"Morgen ______\"",
        "questionType": "choose-correct",
        "options": [
          "Morgen ich gehe in die Schule.",
          "Morgen gehe ich in die Schule.",
          "Morgen in die Schule ich gehe.",
          "Morgen ich in die Schule gehe."
        ],
        "correctIndex": 1,
        "explanation": "Quy tắc vị trí thứ 2: khi trạng từ đứng đầu câu (Morgen), động từ vẫn phải ở vị trí thứ 2 và chủ ngữ chuyển ra sau. 'Morgen [1] gehe [2] ich [3] in die Schule.'",
        "points": 10
      },
      {
        "id": "g-a1-030",
        "level": "A1",
        "topic": "word-order",
        "topicLabel": "Trật tự từ cơ bản",
        "question": "Trong câu hỏi W-Fragen, động từ đứng ở vị trí nào?",
        "questionType": "choose-correct",
        "options": [
          "Vị trí 1 (đầu câu, trước từ W-)",
          "Vị trí 2 (sau từ W-)",
          "Vị trí cuối câu",
          "Bất kỳ vị trí nào cũng được"
        ],
        "correctIndex": 1,
        "explanation": "Trong câu hỏi W-Fragen: Từ W- [1] — Động từ [2] — Chủ ngữ [3] — Phần còn lại. Ví dụ: 'Wo [1] wohnst [2] du [3]?' / 'Was [1] machst [2] du [3]?'. Động từ luôn ở vị trí thứ 2.",
        "points": 10
      }
    ]
  },
  "vocabulary": {
    "meta": {
      "version": "1.0",
      "level": "A1",
      "totalWords": 50,
      "description": "Bộ từ vựng tiếng Đức trình độ A1 — 50 từ cốt lõi"
    },
    "words": [
      {
        "id": "v-a1-001",
        "level": "A1",
        "theme": "greeting",
        "themeLabel": "Chào hỏi",
        "word": "Hallo",
        "wordType": "exclamation",
        "article": null,
        "plural": null,
        "meaning": "Xin chào",
        "exampleDE": "Hallo! Wie geht es dir?",
        "exampleVI": "Xin chào! Bạn có khỏe không?",
        "pronunciation": "ha-lo",
        "notes": "Dùng trong giao tiếp thân mật với bạn bè, không dùng trong văn phòng trang trọng."
      },
      {
        "id": "v-a1-002",
        "level": "A1",
        "theme": "greeting",
        "themeLabel": "Chào hỏi",
        "word": "Guten Tag",
        "wordType": "exclamation",
        "article": null,
        "plural": null,
        "meaning": "Chào buổi chiều / Xin chào (trang trọng)",
        "exampleDE": "Guten Tag, Herr Müller!",
        "exampleVI": "Chào ông Müller!",
        "pronunciation": "gu-ten tak",
        "notes": "Dùng từ 10 giờ sáng đến 5 giờ chiều trong các tình huống trang trọng hoặc với người lạ."
      },
      {
        "id": "v-a1-003",
        "level": "A1",
        "theme": "greeting",
        "themeLabel": "Chào hỏi",
        "word": "Tschüss",
        "wordType": "exclamation",
        "article": null,
        "plural": null,
        "meaning": "Tạm biệt (thân mật)",
        "exampleDE": "Tschüss, bis morgen!",
        "exampleVI": "Tạm biệt, hẹn gặp lại ngày mai!",
        "pronunciation": "chuws",
        "notes": "Dùng với bạn bè. Với người lớn tuổi hoặc trang trọng: 'Auf Wiedersehen'."
      },
      {
        "id": "v-a1-004",
        "level": "A1",
        "theme": "greeting",
        "themeLabel": "Chào hỏi",
        "word": "Bitte",
        "wordType": "adverb",
        "article": null,
        "plural": null,
        "meaning": "Xin vui lòng / Không có chi",
        "exampleDE": "Ein Kaffee, bitte. — Danke! — Bitte!",
        "exampleVI": "Một ly cà phê, làm ơn. — Cảm ơn! — Không có chi!",
        "pronunciation": "bit-teh",
        "notes": "Dùng cả hai nghĩa: nhờ vả ('Bitte!' khi yêu cầu) và đáp lại lời cảm ơn ('Bitte!' = Không có chi)."
      },
      {
        "id": "v-a1-005",
        "level": "A1",
        "theme": "greeting",
        "themeLabel": "Chào hỏi",
        "word": "Danke",
        "wordType": "exclamation",
        "article": null,
        "plural": null,
        "meaning": "Cảm ơn",
        "exampleDE": "Danke schön! Das ist sehr nett.",
        "exampleVI": "Cảm ơn rất nhiều! Thật tốt bụng quá.",
        "pronunciation": "dang-keh",
        "notes": "Mạnh hơn: 'Danke schön' hoặc 'Vielen Dank' (Cảm ơn nhiều lắm)."
      },
      {
        "id": "v-a1-006",
        "level": "A1",
        "theme": "greeting",
        "themeLabel": "Chào hỏi",
        "word": "Entschuldigung",
        "wordType": "exclamation",
        "article": null,
        "plural": null,
        "meaning": "Xin lỗi / Xin phép",
        "exampleDE": "Entschuldigung, wo ist der Bahnhof?",
        "exampleVI": "Xin lỗi, ga tàu ở đâu ạ?",
        "pronunciation": "ent-shul-di-gung",
        "notes": "Dùng khi xin lỗi hoặc khi muốn hỏi đường. Ngắn hơn: 'Entschuldige' (thân mật)."
      },
      {
        "id": "v-a1-007",
        "level": "A1",
        "theme": "family",
        "themeLabel": "Gia đình",
        "word": "die Mutter",
        "wordType": "noun",
        "article": "die",
        "plural": "die Mütter",
        "meaning": "người mẹ",
        "exampleDE": "Meine Mutter heißt Anna.",
        "exampleVI": "Mẹ tôi tên là Anna.",
        "pronunciation": "mut-ter",
        "notes": "Giống cái (feminin). Dạng số nhiều biến nguyên âm u → ü."
      },
      {
        "id": "v-a1-008",
        "level": "A1",
        "theme": "family",
        "themeLabel": "Gia đình",
        "word": "der Vater",
        "wordType": "noun",
        "article": "der",
        "plural": "die Väter",
        "meaning": "người cha",
        "exampleDE": "Mein Vater arbeitet bei BMW.",
        "exampleVI": "Bố tôi làm việc tại BMW.",
        "pronunciation": "fa-ter",
        "notes": "Giống đực (maskulin). Số nhiều biến a → ä."
      },
      {
        "id": "v-a1-009",
        "level": "A1",
        "theme": "family",
        "themeLabel": "Gia đình",
        "word": "der Bruder",
        "wordType": "noun",
        "article": "der",
        "plural": "die Brüder",
        "meaning": "người anh / em trai",
        "exampleDE": "Ich habe einen Bruder.",
        "exampleVI": "Tôi có một người anh/em trai.",
        "pronunciation": "bru-der",
        "notes": "Tiếng Đức không phân biệt anh và em trai — cả hai đều là 'Bruder'. Muốn phân biệt: 'älterer Bruder' (anh) và 'jüngerer Bruder' (em)."
      },
      {
        "id": "v-a1-010",
        "level": "A1",
        "theme": "family",
        "themeLabel": "Gia đình",
        "word": "die Schwester",
        "wordType": "noun",
        "article": "die",
        "plural": "die Schwestern",
        "meaning": "người chị / em gái",
        "exampleDE": "Meine Schwester studiert in Köln.",
        "exampleVI": "Chị/em gái tôi học đại học ở Köln.",
        "pronunciation": "shves-ter",
        "notes": "Giống cái. Không phân biệt chị/em — dùng 'ältere' (lớn hơn) và 'jüngere' (nhỏ hơn) để phân biệt."
      },
      {
        "id": "v-a1-011",
        "level": "A1",
        "theme": "family",
        "themeLabel": "Gia đình",
        "word": "die Familie",
        "wordType": "noun",
        "article": "die",
        "plural": "die Familien",
        "meaning": "gia đình",
        "exampleDE": "Meine Familie wohnt in Hanoi.",
        "exampleVI": "Gia đình tôi sống ở Hà Nội.",
        "pronunciation": "fa-mi-lye",
        "notes": "Giống cái. Phát âm chữ 'ie' ở cuối như 'ye'."
      },
      {
        "id": "v-a1-012",
        "level": "A1",
        "theme": "family",
        "themeLabel": "Gia đình",
        "word": "das Kind",
        "wordType": "noun",
        "article": "das",
        "plural": "die Kinder",
        "meaning": "đứa trẻ, đứa con",
        "exampleDE": "Das Kind spielt im Garten.",
        "exampleVI": "Đứa trẻ đang chơi trong vườn.",
        "pronunciation": "kint",
        "notes": "Giống trung. Số nhiều 'Kinder' không theo quy tắc thông thường."
      },
      {
        "id": "v-a1-013",
        "level": "A1",
        "theme": "school",
        "themeLabel": "Trường học",
        "word": "die Schule",
        "wordType": "noun",
        "article": "die",
        "plural": "die Schulen",
        "meaning": "trường học",
        "exampleDE": "Ich gehe jeden Tag in die Schule.",
        "exampleVI": "Tôi đi học mỗi ngày.",
        "pronunciation": "shu-leh",
        "notes": "Giống cái. 'in die Schule gehen' = đi học (đến trường)."
      },
      {
        "id": "v-a1-014",
        "level": "A1",
        "theme": "school",
        "themeLabel": "Trường học",
        "word": "das Buch",
        "wordType": "noun",
        "article": "das",
        "plural": "die Bücher",
        "meaning": "cuốn sách",
        "exampleDE": "Das Buch ist sehr interessant.",
        "exampleVI": "Cuốn sách rất thú vị.",
        "pronunciation": "buch (ch nhẹ)",
        "notes": "Giống trung. Chữ 'ch' trong tiếng Đức phát âm như 'kh' nhẹ phía sau cổ họng."
      },
      {
        "id": "v-a1-015",
        "level": "A1",
        "theme": "school",
        "themeLabel": "Trường học",
        "word": "der Lehrer",
        "wordType": "noun",
        "article": "der",
        "plural": "die Lehrer",
        "meaning": "giáo viên (nam)",
        "exampleDE": "Unser Lehrer heißt Herr Schmidt.",
        "exampleVI": "Giáo viên của chúng tôi tên là ông Schmidt.",
        "pronunciation": "leh-rer",
        "notes": "Số nhiều giống nguyên mẫu (không đổi). Giáo viên nữ: 'die Lehrerin' / số nhiều: 'die Lehrerinnen'."
      },
      {
        "id": "v-a1-016",
        "level": "A1",
        "theme": "school",
        "themeLabel": "Trường học",
        "word": "der Schüler",
        "wordType": "noun",
        "article": "der",
        "plural": "die Schüler",
        "meaning": "học sinh (nam)",
        "exampleDE": "Die Schüler lernen Englisch.",
        "exampleVI": "Các học sinh đang học tiếng Anh.",
        "pronunciation": "shu-ler",
        "notes": "Dùng cho học sinh phổ thông. Sinh viên đại học: 'der Student / die Studentin'."
      },
      {
        "id": "v-a1-017",
        "level": "A1",
        "theme": "school",
        "themeLabel": "Trường học",
        "word": "lernen",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "học, học tập",
        "exampleDE": "Ich lerne jeden Tag Deutsch.",
        "exampleVI": "Tôi học tiếng Đức mỗi ngày.",
        "pronunciation": "ler-nen",
        "notes": "Phân biệt: 'lernen' (tự học, cố gắng ghi nhớ) vs 'studieren' (học đại học, nghiên cứu)."
      },
      {
        "id": "v-a1-018",
        "level": "A1",
        "theme": "school",
        "themeLabel": "Trường học",
        "word": "schreiben",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "viết",
        "exampleDE": "Kannst du deinen Namen schreiben?",
        "exampleVI": "Bạn có thể viết tên mình không?",
        "pronunciation": "shrai-ben",
        "notes": "Động từ bất quy tắc trong thì quá khứ: schreiben → schrieb → geschrieben."
      },
      {
        "id": "v-a1-019",
        "level": "A1",
        "theme": "jobs",
        "themeLabel": "Nghề nghiệp",
        "word": "der Arzt",
        "wordType": "noun",
        "article": "der",
        "plural": "die Ärzte",
        "meaning": "bác sĩ (nam)",
        "exampleDE": "Ich bin Arzt von Beruf.",
        "exampleVI": "Tôi là bác sĩ theo nghề nghiệp.",
        "pronunciation": "artst",
        "notes": "Bác sĩ nữ: 'die Ärztin'. Khi nói nghề nghiệp KHÔNG dùng mạo từ: 'Ich bin Arzt' (không phải 'ein Arzt')."
      },
      {
        "id": "v-a1-020",
        "level": "A1",
        "theme": "jobs",
        "themeLabel": "Nghề nghiệp",
        "word": "die Ärztin",
        "wordType": "noun",
        "article": "die",
        "plural": "die Ärztinnen",
        "meaning": "bác sĩ (nữ)",
        "exampleDE": "Die Ärztin ist sehr freundlich.",
        "exampleVI": "Bác sĩ (nữ) rất thân thiện.",
        "pronunciation": "erts-tin",
        "notes": "Hầu hết nghề nghiệp nữ trong tiếng Đức thêm đuôi '-in' vào dạng nam."
      },
      {
        "id": "v-a1-021",
        "level": "A1",
        "theme": "jobs",
        "themeLabel": "Nghề nghiệp",
        "word": "der Ingenieur",
        "wordType": "noun",
        "article": "der",
        "plural": "die Ingenieure",
        "meaning": "kỹ sư (nam)",
        "exampleDE": "Er arbeitet als Ingenieur.",
        "exampleVI": "Anh ấy làm việc với tư cách kỹ sư.",
        "pronunciation": "in-ge-ni-ör",
        "notes": "Nghề nữ: 'die Ingenieurin'. Chữ 'eu' phát âm như 'ör' (ö)."
      },
      {
        "id": "v-a1-022",
        "level": "A1",
        "theme": "jobs",
        "themeLabel": "Nghề nghiệp",
        "word": "der Student",
        "wordType": "noun",
        "article": "der",
        "plural": "die Studenten",
        "meaning": "sinh viên (nam)",
        "exampleDE": "Ich bin Student an der Universität.",
        "exampleVI": "Tôi là sinh viên đại học.",
        "pronunciation": "shtu-dent",
        "notes": "Sinh viên nữ: 'die Studentin'. Phân biệt với 'Schüler' (học sinh phổ thông)."
      },
      {
        "id": "v-a1-023",
        "level": "A1",
        "theme": "jobs",
        "themeLabel": "Nghề nghiệp",
        "word": "arbeiten",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "làm việc",
        "exampleDE": "Wo arbeiten Sie?",
        "exampleVI": "Ngài làm việc ở đâu?",
        "pronunciation": "ar-bai-ten",
        "notes": "Động từ đặc biệt: gốc kết thúc bằng '-t' → ngôi du: 'du arbeitest', er/sie: 'er arbeitet' (thêm 'e' đệm)."
      },
      {
        "id": "v-a1-024",
        "level": "A1",
        "theme": "home",
        "themeLabel": "Nhà cửa",
        "word": "das Haus",
        "wordType": "noun",
        "article": "das",
        "plural": "die Häuser",
        "meaning": "ngôi nhà, tòa nhà",
        "exampleDE": "Wir wohnen in einem großen Haus.",
        "exampleVI": "Chúng tôi sống trong một ngôi nhà lớn.",
        "pronunciation": "haus",
        "notes": "Giống trung. Số nhiều biến au → äu. Phân biệt: 'das Haus' (nhà riêng) vs 'die Wohnung' (căn hộ)."
      },
      {
        "id": "v-a1-025",
        "level": "A1",
        "theme": "home",
        "themeLabel": "Nhà cửa",
        "word": "die Wohnung",
        "wordType": "noun",
        "article": "die",
        "plural": "die Wohnungen",
        "meaning": "căn hộ, chỗ ở",
        "exampleDE": "Ich suche eine kleine Wohnung.",
        "exampleVI": "Tôi đang tìm một căn hộ nhỏ.",
        "pronunciation": "voh-nung",
        "notes": "Giống cái. Chữ 'w' đầu từ đọc như 'v'. 'wohnen' (động từ) = sống ở, cư trú."
      },
      {
        "id": "v-a1-026",
        "level": "A1",
        "theme": "home",
        "themeLabel": "Nhà cửa",
        "word": "das Zimmer",
        "wordType": "noun",
        "article": "das",
        "plural": "die Zimmer",
        "meaning": "căn phòng",
        "exampleDE": "Mein Zimmer ist nicht sehr groß.",
        "exampleVI": "Phòng của tôi không lớn lắm.",
        "pronunciation": "tsim-mer",
        "notes": "Giống trung. Số nhiều không đổi ('die Zimmer'). Phòng cụ thể: 'das Schlafzimmer' (phòng ngủ), 'das Wohnzimmer' (phòng khách)."
      },
      {
        "id": "v-a1-027",
        "level": "A1",
        "theme": "home",
        "themeLabel": "Nhà cửa",
        "word": "die Küche",
        "wordType": "noun",
        "article": "die",
        "plural": "die Küchen",
        "meaning": "nhà bếp",
        "exampleDE": "Die Küche ist sehr modern.",
        "exampleVI": "Nhà bếp rất hiện đại.",
        "pronunciation": "kü-khe",
        "notes": "Giống cái. 'ü' phát âm như 'i' nhưng tròn môi. 'kochen' (động từ) = nấu ăn."
      },
      {
        "id": "v-a1-028",
        "level": "A1",
        "theme": "home",
        "themeLabel": "Nhà cửa",
        "word": "das Bad",
        "wordType": "noun",
        "article": "das",
        "plural": "die Bäder",
        "meaning": "phòng tắm",
        "exampleDE": "Das Bad hat eine Badewanne.",
        "exampleVI": "Phòng tắm có bồn tắm.",
        "pronunciation": "bat",
        "notes": "Giống trung. Đầy đủ là 'das Badezimmer'. Chữ 'd' cuối từ đọc gần như 't'."
      },
      {
        "id": "v-a1-029",
        "level": "A1",
        "theme": "home",
        "themeLabel": "Nhà cửa",
        "word": "der Garten",
        "wordType": "noun",
        "article": "der",
        "plural": "die Gärten",
        "meaning": "khu vườn",
        "exampleDE": "Die Kinder spielen im Garten.",
        "exampleVI": "Bọn trẻ chơi trong vườn.",
        "pronunciation": "gar-ten",
        "notes": "Giống đực. Số nhiều biến a → ä."
      },
      {
        "id": "v-a1-030",
        "level": "A1",
        "theme": "food",
        "themeLabel": "Thức ăn & Đồ uống",
        "word": "das Brot",
        "wordType": "noun",
        "article": "das",
        "plural": "die Brote",
        "meaning": "bánh mì",
        "exampleDE": "Zum Frühstück esse ich Brot.",
        "exampleVI": "Vào bữa sáng tôi ăn bánh mì.",
        "pronunciation": "brot",
        "notes": "Giống trung. Bánh mì là thực phẩm cơ bản của người Đức — có hơn 300 loại bánh mì khác nhau!"
      },
      {
        "id": "v-a1-031",
        "level": "A1",
        "theme": "food",
        "themeLabel": "Thức ăn & Đồ uống",
        "word": "das Wasser",
        "wordType": "noun",
        "article": "das",
        "plural": null,
        "meaning": "nước (uống)",
        "exampleDE": "Ich trinke gern Wasser.",
        "exampleVI": "Tôi thích uống nước.",
        "pronunciation": "vas-ser",
        "notes": "Giống trung. Không có số nhiều thông thường. Chữ 'w' đọc như 'v'."
      },
      {
        "id": "v-a1-032",
        "level": "A1",
        "theme": "food",
        "themeLabel": "Thức ăn & Đồ uống",
        "word": "der Kaffee",
        "wordType": "noun",
        "article": "der",
        "plural": "die Kaffees",
        "meaning": "cà phê",
        "exampleDE": "Möchten Sie einen Kaffee?",
        "exampleVI": "Ngài có muốn uống cà phê không?",
        "pronunciation": "ka-feh",
        "notes": "Giống đực. Người Đức uống rất nhiều cà phê — là một trong những nước tiêu thụ nhiều nhất thế giới."
      },
      {
        "id": "v-a1-033",
        "level": "A1",
        "theme": "food",
        "themeLabel": "Thức ăn & Đồ uống",
        "word": "der Apfel",
        "wordType": "noun",
        "article": "der",
        "plural": "die Äpfel",
        "meaning": "quả táo",
        "exampleDE": "Ein Apfel am Tag hält den Arzt fern.",
        "exampleVI": "Mỗi ngày một quả táo giúp tránh xa bác sĩ.",
        "pronunciation": "ap-fel",
        "notes": "Giống đực. Đây là câu thành ngữ tiếng Đức phổ biến (tương đương 'An apple a day...')."
      },
      {
        "id": "v-a1-034",
        "level": "A1",
        "theme": "food",
        "themeLabel": "Thức ăn & Đồ uống",
        "word": "essen",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "ăn",
        "exampleDE": "Was essen wir heute Abend?",
        "exampleVI": "Tối nay chúng ta ăn gì?",
        "pronunciation": "es-sen",
        "notes": "Động từ bất quy tắc: ich esse, du isst, er isst, wir essen. Chú ý: ngôi 'du' và 'er' là 'isst'!"
      },
      {
        "id": "v-a1-035",
        "level": "A1",
        "theme": "food",
        "themeLabel": "Thức ăn & Đồ uống",
        "word": "trinken",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "uống",
        "exampleDE": "Ich trinke jeden Morgen Kaffee.",
        "exampleVI": "Mỗi buổi sáng tôi uống cà phê.",
        "pronunciation": "tring-ken",
        "notes": "Động từ bất quy tắc trong thì quá khứ: trinken → trank → getrunken."
      },
      {
        "id": "v-a1-036",
        "level": "A1",
        "theme": "time",
        "themeLabel": "Thời gian & Ngày tháng",
        "word": "der Tag",
        "wordType": "noun",
        "article": "der",
        "plural": "die Tage",
        "meaning": "ngày",
        "exampleDE": "Guten Tag! Wie ist Ihr Tag?",
        "exampleVI": "Chào buổi chiều! Ngày của bạn thế nào?",
        "pronunciation": "tak",
        "notes": "Giống đực. 'Guten Tag!' = lời chào ban ngày. 'jeden Tag' = mỗi ngày."
      },
      {
        "id": "v-a1-037",
        "level": "A1",
        "theme": "time",
        "themeLabel": "Thời gian & Ngày tháng",
        "word": "die Woche",
        "wordType": "noun",
        "article": "die",
        "plural": "die Wochen",
        "meaning": "tuần",
        "exampleDE": "Nächste Woche habe ich Urlaub.",
        "exampleVI": "Tuần tới tôi được nghỉ phép.",
        "pronunciation": "vo-khe",
        "notes": "Giống cái. 'diese Woche' = tuần này, 'letzte Woche' = tuần trước."
      },
      {
        "id": "v-a1-038",
        "level": "A1",
        "theme": "time",
        "themeLabel": "Thời gian & Ngày tháng",
        "word": "der Monat",
        "wordType": "noun",
        "article": "der",
        "plural": "die Monate",
        "meaning": "tháng",
        "exampleDE": "Im Monat Januar ist es sehr kalt.",
        "exampleVI": "Vào tháng Giêng thì rất lạnh.",
        "pronunciation": "mo-nat",
        "notes": "Giống đực. Phân biệt với 'der Mond' (mặt trăng) — cùng gốc nhưng khác nghĩa!"
      },
      {
        "id": "v-a1-039",
        "level": "A1",
        "theme": "time",
        "themeLabel": "Thời gian & Ngày tháng",
        "word": "heute",
        "wordType": "adverb",
        "article": null,
        "plural": null,
        "meaning": "hôm nay",
        "exampleDE": "Heute lerne ich Deutsch.",
        "exampleVI": "Hôm nay tôi học tiếng Đức.",
        "pronunciation": "hoi-teh",
        "notes": "Trạng từ chỉ thời gian. 'heute Morgen' = sáng hôm nay, 'heute Abend' = tối hôm nay."
      },
      {
        "id": "v-a1-040",
        "level": "A1",
        "theme": "time",
        "themeLabel": "Thời gian & Ngày tháng",
        "word": "morgen",
        "wordType": "adverb",
        "article": null,
        "plural": null,
        "meaning": "ngày mai / buổi sáng",
        "exampleDE": "Morgen gehe ich zum Arzt.",
        "exampleVI": "Ngày mai tôi đi gặp bác sĩ.",
        "pronunciation": "mor-gen",
        "notes": "Chú ý: 'morgen' (thường) = ngày mai; 'der Morgen' (viết hoa) = buổi sáng. 'morgen Morgen' = sáng mai."
      },
      {
        "id": "v-a1-041",
        "level": "A1",
        "theme": "transport",
        "themeLabel": "Địa điểm & Phương tiện",
        "word": "das Auto",
        "wordType": "noun",
        "article": "das",
        "plural": "die Autos",
        "meaning": "xe ô tô, xe hơi",
        "exampleDE": "Ich fahre mit dem Auto zur Arbeit.",
        "exampleVI": "Tôi đi xe hơi đến chỗ làm.",
        "pronunciation": "au-to",
        "notes": "Giống trung. Số nhiều chỉ thêm 's'. Người Đức nổi tiếng với ngành công nghiệp ô tô (BMW, Mercedes, VW)."
      },
      {
        "id": "v-a1-042",
        "level": "A1",
        "theme": "transport",
        "themeLabel": "Địa điểm & Phương tiện",
        "word": "der Bus",
        "wordType": "noun",
        "article": "der",
        "plural": "die Busse",
        "meaning": "xe buýt",
        "exampleDE": "Ich nehme den Bus Nummer 10.",
        "exampleVI": "Tôi đi xe buýt số 10.",
        "pronunciation": "bus",
        "notes": "Giống đực. Số nhiều thêm '-se'. 'mit dem Bus fahren' = đi bằng xe buýt."
      },
      {
        "id": "v-a1-043",
        "level": "A1",
        "theme": "transport",
        "themeLabel": "Địa điểm & Phương tiện",
        "word": "die Bahn",
        "wordType": "noun",
        "article": "die",
        "plural": "die Bahnen",
        "meaning": "tàu hỏa, đường tàu",
        "exampleDE": "Ich fahre mit der Bahn nach München.",
        "exampleVI": "Tôi đi tàu đến München.",
        "pronunciation": "ban",
        "notes": "Giống cái. 'die Deutsche Bahn' = công ty đường sắt quốc gia Đức (DB). 'die U-Bahn' = tàu điện ngầm."
      },
      {
        "id": "v-a1-044",
        "level": "A1",
        "theme": "transport",
        "themeLabel": "Địa điểm & Phương tiện",
        "word": "fahren",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "đi (bằng phương tiện), lái xe",
        "exampleDE": "Ich fahre morgen nach Berlin.",
        "exampleVI": "Ngày mai tôi đi Berlin.",
        "pronunciation": "fa-ren",
        "notes": "Động từ bất quy tắc: ich fahre, du fährst, er fährt. Chú ý: ngôi 'du' và 'er' biến nguyên âm a → ä."
      },
      {
        "id": "v-a1-045",
        "level": "A1",
        "theme": "transport",
        "themeLabel": "Địa điểm & Phương tiện",
        "word": "gehen",
        "wordType": "verb",
        "article": null,
        "plural": null,
        "meaning": "đi bộ, đi",
        "exampleDE": "Wir gehen zusammen in die Stadt.",
        "exampleVI": "Chúng tôi cùng nhau đi vào thành phố.",
        "pronunciation": "geh-en",
        "notes": "Phân biệt: 'gehen' (đi bộ hoặc đi nói chung) vs 'fahren' (đi bằng phương tiện). 'Wie geht es dir?' = Bạn khỏe không?"
      },
      {
        "id": "v-a1-046",
        "level": "A1",
        "theme": "adjectives",
        "themeLabel": "Tính từ cơ bản",
        "word": "gut",
        "wordType": "adjective",
        "article": null,
        "plural": null,
        "meaning": "tốt, ngon, giỏi",
        "exampleDE": "Das Essen ist sehr gut!",
        "exampleVI": "Đồ ăn rất ngon!",
        "pronunciation": "gut",
        "notes": "Tính từ cơ bản nhất. 'Alles gut?' = Mọi thứ ổn chứ? 'Gut gemacht!' = Làm tốt lắm!"
      },
      {
        "id": "v-a1-047",
        "level": "A1",
        "theme": "adjectives",
        "themeLabel": "Tính từ cơ bản",
        "word": "schlecht",
        "wordType": "adjective",
        "article": null,
        "plural": null,
        "meaning": "tệ, xấu, kém",
        "exampleDE": "Das Wetter ist heute schlecht.",
        "exampleVI": "Thời tiết hôm nay xấu.",
        "pronunciation": "shlekht",
        "notes": "Trái nghĩa với 'gut'. 'Mir geht es schlecht.' = Tôi cảm thấy không tốt."
      },
      {
        "id": "v-a1-048",
        "level": "A1",
        "theme": "adjectives",
        "themeLabel": "Tính từ cơ bản",
        "word": "groß",
        "wordType": "adjective",
        "article": null,
        "plural": null,
        "meaning": "to, lớn, cao",
        "exampleDE": "Berlin ist eine große Stadt.",
        "exampleVI": "Berlin là một thành phố lớn.",
        "pronunciation": "gros",
        "notes": "Chữ 'ß' = 'ss' (đọc là 's' dài). Trái nghĩa: 'klein' (nhỏ)."
      },
      {
        "id": "v-a1-049",
        "level": "A1",
        "theme": "adjectives",
        "themeLabel": "Tính từ cơ bản",
        "word": "klein",
        "wordType": "adjective",
        "article": null,
        "plural": null,
        "meaning": "nhỏ, thấp",
        "exampleDE": "Mein Bruder ist noch klein.",
        "exampleVI": "Em trai tôi vẫn còn nhỏ.",
        "pronunciation": "klain",
        "notes": "Trái nghĩa với 'groß'. Cũng có nghĩa là 'thấp bé' khi nói về người."
      },
      {
        "id": "v-a1-050",
        "level": "A1",
        "theme": "adjectives",
        "themeLabel": "Tính từ cơ bản",
        "word": "schön",
        "wordType": "adjective",
        "article": null,
        "plural": null,
        "meaning": "đẹp, tuyệt vời",
        "exampleDE": "Das Wetter ist heute sehr schön.",
        "exampleVI": "Hôm nay thời tiết rất đẹp.",
        "pronunciation": "shön",
        "notes": "'ö' phát âm giống 'ê' nhưng tròn môi. 'Schönen Tag noch!' = Chúc bạn một ngày tốt lành!"
      }
    ]
  },
  "placement": {
    "meta": {
      "version": "1.0",
      "level": "A1",
      "totalQuestions": 12,
      "description": "Bài kiểm tra xếp trình độ A1 — 12 câu trải đều 7 chủ đề ngữ pháp nền tảng"
    },
    "questions": [
      {
        "id": "pl-001",
        "topic": "sein-haben",
        "question": "Điền dạng đúng: \"Ich ______ Student.\"",
        "options": [
          "bin",
          "bist",
          "ist",
          "sind"
        ],
        "correctIndex": 0,
        "explanation": "Chủ ngữ 'ich' đi với 'bin' của động từ sein."
      },
      {
        "id": "pl-002",
        "topic": "sein-haben",
        "question": "Chọn từ đúng: \"______ du Zeit?\" (Bạn có thời gian không?)",
        "options": [
          "Bist",
          "Hast",
          "Hat",
          "Habt"
        ],
        "correctIndex": 1,
        "explanation": "'Zeit haben' dùng haben; chủ ngữ 'du' đi với 'hast'."
      },
      {
        "id": "pl-003",
        "topic": "regular-verbs",
        "question": "Chia động từ: \"Du ______ Deutsch.\" (lernen)",
        "options": [
          "lerne",
          "lernst",
          "lernt",
          "lernen"
        ],
        "correctIndex": 1,
        "explanation": "Ngôi 'du' thêm đuôi -st: lern + st = lernst."
      },
      {
        "id": "pl-004",
        "topic": "regular-verbs",
        "question": "Chia động từ: \"Er ______ in Berlin.\" (wohnen)",
        "options": [
          "wohne",
          "wohnst",
          "wohnt",
          "wohnen"
        ],
        "correctIndex": 2,
        "explanation": "Ngôi 'er/sie/es' thêm đuôi -t: wohn + t = wohnt."
      },
      {
        "id": "pl-005",
        "topic": "pronouns",
        "question": "Thay danh từ bằng đại từ: \"Das Buch ist neu. ______ ist interessant.\"",
        "options": [
          "Er",
          "Sie",
          "Es",
          "Ihr"
        ],
        "correctIndex": 2,
        "explanation": "'das Buch' là giống trung nên thay bằng 'es'."
      },
      {
        "id": "pl-006",
        "topic": "pronouns",
        "question": "Thay danh từ bằng đại từ: \"Der Mann heißt Thomas. ______ ist Lehrer.\"",
        "options": [
          "Sie",
          "Es",
          "Er",
          "Wir"
        ],
        "correctIndex": 2,
        "explanation": "'der Mann' là giống đực nên thay bằng 'er'."
      },
      {
        "id": "pl-007",
        "topic": "articles",
        "question": "Chọn mạo từ đúng: \"______ Frau ist Ärztin.\"",
        "options": [
          "Der",
          "Die",
          "Das",
          "Den"
        ],
        "correctIndex": 1,
        "explanation": "'Frau' là danh từ giống cái nên dùng 'die'."
      },
      {
        "id": "pl-008",
        "topic": "articles",
        "question": "Chọn mạo từ đúng: \"______ Kind spielt im Garten.\"",
        "options": [
          "Der",
          "Die",
          "Das",
          "Den"
        ],
        "correctIndex": 2,
        "explanation": "'Kind' là danh từ giống trung nên dùng 'das'."
      },
      {
        "id": "pl-009",
        "topic": "negation",
        "question": "Chọn phủ định đúng: \"Ich habe ______ Zeit.\" (Tôi không có thời gian.)",
        "options": [
          "nicht",
          "kein",
          "keine",
          "keinen"
        ],
        "correctIndex": 2,
        "explanation": "'Zeit' là danh từ giống cái, phủ định bằng 'keine'."
      },
      {
        "id": "pl-010",
        "topic": "negation",
        "question": "Chọn phủ định đúng: \"Das Essen ist ______ gut.\"",
        "options": [
          "kein",
          "keine",
          "nicht",
          "keinen"
        ],
        "correctIndex": 2,
        "explanation": "Phủ định tính từ 'gut' dùng 'nicht', không dùng kein."
      },
      {
        "id": "pl-011",
        "topic": "questions",
        "question": "Chọn từ hỏi đúng: \"______ wohnst du?\" (Bạn sống ở đâu?)",
        "options": [
          "Wo",
          "Wer",
          "Was",
          "Wie"
        ],
        "correctIndex": 0,
        "explanation": "'Wo' hỏi về địa điểm; 'Wer' hỏi người, 'Was' hỏi vật."
      },
      {
        "id": "pl-012",
        "topic": "word-order",
        "question": "Chọn dạng đúng: \"Morgen ______ ich in die Schule.\" (gehen)",
        "options": [
          "gehe",
          "gehen",
          "geht",
          "gehst"
        ],
        "correctIndex": 0,
        "explanation": "Trạng từ đứng đầu câu, động từ vẫn ở vị trí 2: Morgen gehe ich…"
      }
    ]
  }
};
