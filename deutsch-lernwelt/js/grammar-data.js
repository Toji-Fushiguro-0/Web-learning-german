// js/grammar-data.js — PHIÊN BẢN 2.0
// Cấu hình CẤU TRÚC các bài học (metadata + lý thuyết)
// Câu hỏi trắc nghiệm nay được lưu riêng trong data/grammar.json
// "questionTopic" là key để lọc câu hỏi từ grammar.json

const GRAMMAR_LESSONS = [
  {
    id: "a1-sein-haben",
    level: "A1",
    topic: "Động từ cơ bản",
    questionTopic: "sein-haben",    // Khớp với field "topic" trong grammar.json
    unitId: "unit-1",
    prerequisites: [],
    competencies: [
      "Chia đúng sein/haben ở thì hiện tại",
      "Dùng sein cho nghề nghiệp, quốc tịch, trạng thái",
      "Dùng haben cho sở hữu và cảm giác (Hunger, Durst)"
    ],
    title: "Động từ sein và haben",
    summary: "Nắm vững cách chia và cách dùng của 2 động từ bất quy tắc quan trọng nhất trong tiếng Đức — nền tảng cho mọi câu tiếng Đức.",
    estimatedTime: "25 phút",
    theory: {
      intro: "Trong tiếng Đức, <strong>sein</strong> (to be — thì/là/ở) và <strong>haben</strong> (to have — có) là hai động từ nền tảng. Chúng vừa là động từ chính diễn đạt trạng thái, sở hữu, vừa là trợ động từ để cấu tạo thì quá khứ (Perfekt) sau này.",
      sections: [
        {
          title: "1. Động từ sein (thì, là, ở)",
          description: "sein là động từ bất quy tắc đặc biệt — phải học thuộc lòng. Không có quy tắc biến đổi, mỗi ngôi có dạng riêng:",
          table: {
            headers: ["Đại từ", "sein (hiện tại)", "Ví dụ tiếng Đức", "Dịch tiếng Việt"],
            rows: [
              ["ich (tôi)", "bin", "Ich bin Student.", "Tôi là sinh viên."],
              ["du (bạn)", "bist", "Du bist sehr nett.", "Bạn rất tốt bụng."],
              ["er / sie / es (anh ấy / cô ấy / nó)", "ist", "Er ist in Berlin.", "Anh ấy đang ở Berlin."],
              ["wir (chúng tôi)", "sind", "Wir sind glücklich.", "Chúng tôi đang hạnh phúc."],
              ["ihr (các bạn)", "seid", "Seid ihr bereit?", "Các bạn đã sẵn sàng chưa?"],
              ["sie / Sie (họ / Ngài)", "sind", "Sie sind Lehrer.", "Họ là giáo viên."]
            ]
          },
          notes: [
            "Phát âm: chữ 's' đứng đầu các từ tiếng Đức đọc như 'z' nhẹ (sind → 'zint', seid → 'zait').",
            "sein thường đi với: nghề nghiệp (Ich bin Arzt), quốc tịch (Sie ist Vietnamesin), tính chất (Das Buch ist gut), địa điểm (Wir sind zu Hause)."
          ]
        },
        {
          title: "2. Động từ haben (có, sở hữu)",
          description: "haben diễn tả sự sở hữu. Chú ý: ngôi du và er/sie/es mất chữ 'b' — đây là lỗi phổ biến nhất!",
          table: {
            headers: ["Đại từ", "haben (hiện tại)", "Ví dụ tiếng Đức", "Dịch tiếng Việt"],
            rows: [
              ["ich (tôi)", "habe", "Ich habe ein Buch.", "Tôi có một cuốn sách."],
              ["du (bạn)", "hast", "Hast du Zeit?", "Bạn có thời gian không?"],
              ["er / sie / es (anh ấy / cô ấy / nó)", "hat", "Sie hat eine Katze.", "Cô ấy có một con mèo."],
              ["wir (chúng tôi)", "haben", "Wir haben Hunger.", "Chúng tôi đang đói."],
              ["ihr (các bạn)", "habt", "Ihr habt recht.", "Các bạn nói đúng rồi."],
              ["sie / Sie (họ / Ngài)", "haben", "Haben Sie Fragen?", "Ngài có câu hỏi nào không?"]
            ]
          },
          notes: [
            "Mẹo: du ha-ST (không phải habst), er ha-T (không phải habt). Mất chữ 'b' ở hai ngôi này!",
            "haben dùng cho cảm giác: Hunger haben (đói), Durst haben (khát), Zeit haben (rảnh), Angst haben (sợ)."
          ]
        },
        {
          title: "3. Khi nào dùng sein, khi nào dùng haben?",
          description: "Đây là câu hỏi quan trọng nhất. Hãy nhớ theo nhóm:",
          rules: [
            "Dùng <strong>sein</strong>: nói về danh tính/nghề nghiệp (Ich bin Lehrerin), quốc tịch (Er ist Deutscher), tính chất/trạng thái (Das Wetter ist schön), vị trí/địa điểm (Wir sind in Wien).",
            "Dùng <strong>haben</strong>: nói về quyền sở hữu (Ich habe ein Auto), gia đình (Er hat zwei Schwestern), cảm giác cơ thể/tâm lý (Ich habe Hunger / Angst / Durst)."
          ]
        }
      ]
    }
  },
  {
    id: "a1-regular-verbs",
    level: "A1",
    topic: "Động từ cơ bản",
    questionTopic: "regular-verbs",
    unitId: "unit-1",
    prerequisites: ["a1-sein-haben"],
    competencies: [
      "Chia động từ thường ở Präsens",
      "Xử lý gốc động từ kết thúc bằng -t/-d"
    ],
    title: "Chia động từ thường ở thì hiện tại (Präsens)",
    summary: "Học quy tắc thêm đuôi -e/-st/-t/-en và các trường hợp đặc biệt của gốc động từ kết thúc bằng -ten, -den.",
    estimatedTime: "20 phút",
    theory: {
      intro: "Trong tiếng Đức, hầu hết động từ tuân theo quy tắc chia đuôi nhất quán. Bạn chỉ cần nhớ <strong>gốc động từ</strong> (Verbstamm) và thêm đuôi theo ngôi.",
      sections: [
        {
          title: "1. Quy tắc thêm đuôi cơ bản",
          description: "Để chia một động từ thường, lấy nguyên mẫu (vd: spielen), bỏ đuôi -en, ta được gốc (spiel-), rồi thêm đuôi theo bảng sau:",
          table: {
            headers: ["Đại từ", "Đuôi thêm vào", "spielen (chơi)", "lernen (học)", "wohnen (ở, sinh sống)"],
            rows: [
              ["ich", "-e", "spiele", "lerne", "wohne"],
              ["du", "-st", "spielst", "lernst", "wohnst"],
              ["er / sie / es", "-t", "spielt", "lernt", "wohnt"],
              ["wir", "-en", "spielen", "lernen", "wohnen"],
              ["ihr", "-t", "spielt", "lernt", "wohnt"],
              ["sie / Sie", "-en", "spielen", "lernen", "wohnen"]
            ]
          },
          notes: [
            "Lưu ý: wir và sie/Sie luôn giống nguyên mẫu (spielen = spielen).",
            "Lưu ý: er/sie/es và ihr đều thêm -t nhưng khác chủ ngữ!"
          ]
        },
        {
          title: "2. Trường hợp đặc biệt: gốc kết thúc bằng -t hoặc -d",
          description: "Nếu gốc kết thúc bằng 't' hoặc 'd' (vd: arbeiten, finden), thêm 'e' trước đuôi -st và -t để dễ đọc:",
          table: {
            headers: ["Đại từ", "arbeiten (làm việc)", "finden (tìm)"],
            rows: [
              ["ich", "arbeite", "finde"],
              ["du", "arbeit<strong>e</strong>st", "find<strong>e</strong>st"],
              ["er / sie / es", "arbeit<strong>e</strong>t", "find<strong>e</strong>t"],
              ["wir", "arbeiten", "finden"],
              ["ihr", "arbeit<strong>e</strong>t", "find<strong>e</strong>t"],
              ["sie / Sie", "arbeiten", "finden"]
            ]
          },
          notes: ["Tại sao? Vì người Đức không nói 'arbeitst' — phát âm quá khó. Chữ 'e' đệm vào để câu nói thanh thoát hơn."]
        }
      ]
    }
  },
  {
    id: "a1-articles-gender",
    level: "A1",
    topic: "Mạo từ & Danh từ",
    questionTopic: "articles",
    unitId: "unit-2",
    prerequisites: ["a1-regular-verbs"],
    competencies: [
      "Chọn đúng der/die/das",
      "Nhận biết giống danh từ qua đuôi từ"
    ],
    title: "Mạo từ der, die, das và giống của danh từ",
    summary: "Phân biệt giống đực, giống cái, giống trung và các mẹo nhận biết giống qua đuôi từ.",
    estimatedTime: "30 phút",
    theory: {
      intro: "Mỗi danh từ tiếng Đức đều có <strong>giống</strong> (Genus): maskulin (đực — der), feminin (cái — die), neutral (trung — das). Đây là một trong những điểm khó nhất của tiếng Đức vì không có quy tắc tuyệt đối — bạn phải học thuộc mạo từ cùng với từ.",
      sections: [
        {
          title: "1. Ba loại mạo từ xác định",
          description: "Mạo từ xác định (bestimmter Artikel) tương đương với 'the' trong tiếng Anh:",
          table: {
            headers: ["Giống", "Mạo từ xác định", "Mạo từ bất định", "Ví dụ"],
            rows: [
              ["Maskulin (đực)", "der", "ein", "der Mann (người đàn ông) / ein Mann"],
              ["Feminin (cái)", "die", "eine", "die Frau (người phụ nữ) / eine Frau"],
              ["Neutral (trung)", "das", "ein", "das Kind (đứa trẻ) / ein Kind"],
              ["Số nhiều (tất cả)", "die", "— (không có)", "die Männer / die Frauen"]
            ]
          },
          notes: [
            "Quan trọng: số nhiều của mọi danh từ đều dùng mạo từ 'die'.",
            "Khi viết tiếng Đức: danh từ luôn viết hoa chữ cái đầu (der Mann, die Frau)."
          ]
        },
        {
          title: "2. Mẹo nhận biết giống qua đuôi từ",
          description: "Một số đuôi từ giúp đoán được giống — không 100% nhưng rất hữu ích:",
          table: {
            headers: ["Đuôi từ", "Thường là", "Ví dụ"],
            rows: [
              ["-er, -ismus, -ling", "maskulin (der)", "der Lehrer, der Kapitalismus, der Frühling"],
              ["-ung, -heit, -keit, -tion, -ie", "feminin (die)", "die Wohnung, die Freiheit, die Qualität"],
              ["-chen, -lein, -um, -ment", "neutral (das)", "das Mädchen, das Museum, das Dokument"]
            ]
          },
          notes: ["Chú ý: das Mädchen (cô gái) có giống trung — vì đuôi -chen luôn là neutral dù chỉ người nữ!"]
        }
      ]
    }
  },
  {
    id: "a1-negation",
    level: "A1",
    topic: "Cấu trúc câu",
    questionTopic: "negation",
    unitId: "unit-2",
    prerequisites: ["a1-articles-gender"],
    competencies: [
      "Phân biệt nicht và kein",
      "Đặt phủ định đúng vị trí trong câu"
    ],
    title: "Phủ định với nicht và kein",
    summary: "Phân biệt khi nào dùng nicht (phủ định động từ/tính từ) và kein (phủ định danh từ không xác định).",
    estimatedTime: "20 phút",
    theory: {
      intro: "Tiếng Đức có <strong>hai cách phủ định</strong> chính. Nhầm lẫn giữa <em>nicht</em> và <em>kein</em> là một trong những lỗi phổ biến nhất của người học. Hãy nắm rõ quy tắc dưới đây.",
      sections: [
        {
          title: "1. Phủ định bằng nicht",
          description: "Dùng 'nicht' để phủ định: động từ, tính từ, trạng từ, hoặc danh từ có mạo từ xác định (der/die/das) hay đại từ sở hữu.",
          table: {
            headers: ["Loại phủ định", "Câu khẳng định", "Câu phủ định với nicht"],
            rows: [
              ["Phủ định động từ", "Ich schlafe.", "Ich schlafe nicht. (Tôi không ngủ.)"],
              ["Phủ định tính từ", "Das Essen ist gut.", "Das Essen ist nicht gut. (Đồ ăn không ngon.)"],
              ["Phủ định danh từ + mạo từ xác định", "Ich kenne den Mann.", "Ich kenne den Mann nicht. (Tôi không biết người đàn ông đó.)"]
            ]
          },
          notes: ["Vị trí của 'nicht': thường đứng CUỐI câu, hoặc ngay trước thành phần bị phủ định."]
        },
        {
          title: "2. Phủ định bằng kein",
          description: "Dùng 'kein' để phủ định danh từ đi với mạo từ bất định (ein/eine) hoặc không có mạo từ. kein chia theo giống như ein:",
          table: {
            headers: ["Giống", "Câu khẳng định", "Câu phủ định"],
            rows: [
              ["Maskulin", "Das ist ein Hund.", "Das ist kein Hund. (Đó không phải là chó.)"],
              ["Feminin", "Ich habe eine Schwester.", "Ich habe keine Schwester. (Tôi không có chị gái.)"],
              ["Neutral", "Ich trinke ein Bier.", "Ich trinke kein Bier. (Tôi không uống bia.)"],
              ["Số nhiều", "Wir haben Bücher.", "Wir haben keine Bücher. (Chúng tôi không có sách.)"]
            ]
          },
          notes: ["Mẹo nhanh: Nếu câu khẳng định có 'ein/eine' → câu phủ định dùng 'kein/keine'. Không có 'ein' → dùng 'nicht'."]
        }
      ]
    }
  },
  {
    id: "a1-questions",
    level: "A1",
    topic: "Cấu trúc câu",
    questionTopic: "questions",
    unitId: "unit-3",
    prerequisites: ["a1-negation"],
    competencies: [
      "Đặt câu hỏi Ja/Nein đúng trật tự",
      "Dùng các từ hỏi W- phù hợp"
    ],
    title: "Câu hỏi W-Fragen và Ja/Nein-Fragen",
    summary: "Cách đặt câu hỏi trong tiếng Đức: câu hỏi Yes/No (đảo động từ) và câu hỏi có từ để hỏi W- (Was, Wer, Wie, Wo, ...).",
    estimatedTime: "25 phút",
    theory: {
      intro: "Trong tiếng Đức, câu hỏi được chia làm 2 loại chính: <strong>Ja/Nein-Fragen</strong> (câu hỏi trả lời Có/Không) và <strong>W-Fragen</strong> (câu hỏi có từ để hỏi bắt đầu bằng W).",
      sections: [
        {
          title: "1. Ja/Nein-Fragen (Câu hỏi Yes/No)",
          description: "Cấu trúc: Động từ đứng đầu câu — Chủ ngữ — phần còn lại. Đảo ngược vị trí chủ ngữ và động từ so với câu khẳng định:",
          table: {
            headers: ["Câu khẳng định", "Câu hỏi Ja/Nein", "Trả lời"],
            rows: [
              ["Du sprichst Deutsch.", "Sprichst du Deutsch?", "Ja, ich spreche Deutsch. / Nein, ich spreche kein Deutsch."],
              ["Er wohnt in Berlin.", "Wohnt er in Berlin?", "Ja, er wohnt dort. / Nein, er wohnt nicht in Berlin."],
              ["Sie ist Lehrerin.", "Ist sie Lehrerin?", "Ja, sie ist Lehrerin. / Nein, sie ist keine Lehrerin."]
            ]
          }
        },
        {
          title: "2. W-Fragen (Câu hỏi có từ để hỏi)",
          description: "Cấu trúc: Từ W- — Động từ — Chủ ngữ — phần còn lại:",
          table: {
            headers: ["Từ để hỏi", "Hỏi về", "Ví dụ", "Dịch nghĩa"],
            rows: [
              ["Wer?", "Người nào?", "Wer ist das?", "Đó là ai?"],
              ["Was?", "Cái gì?", "Was machst du?", "Bạn đang làm gì?"],
              ["Wo?", "Ở đâu?", "Wo wohnst du?", "Bạn ở đâu?"],
              ["Woher?", "Từ đâu đến?", "Woher kommst du?", "Bạn đến từ đâu?"],
              ["Wie?", "Như thế nào?", "Wie heißt du?", "Bạn tên là gì?"],
              ["Wann?", "Khi nào?", "Wann kommt er?", "Anh ấy đến khi nào?"],
              ["Warum?", "Tại sao?", "Warum lernst du Deutsch?", "Tại sao bạn học tiếng Đức?"]
            ]
          },
          notes: [
            "Quy tắc vàng: Trong câu hỏi tiếng Đức, động từ luôn đứng ở vị trí thứ 2 (sau từ để hỏi hoặc đứng đầu câu).",
            "Để ý: Wie heißt du? (Bạn tên là gì? — nghĩa đen là 'Bạn được gọi như thế nào?')"
          ]
        }
      ]
    }
  },
  {
    id: "a1-pronouns",
    level: "A1",
    topic: "Đại từ nhân xưng",
    questionTopic: "pronouns",
    unitId: "unit-1",
    prerequisites: ["a1-sein-haben"],
    competencies: [
      "Thay danh từ bằng đại từ đúng giống",
      "Phân biệt sie (họ) và Sie (kính ngữ)"
    ],
    title: "Đại từ nhân xưng (Personalpronomen)",
    summary: "Thay danh từ bằng đại từ đúng giống: der → er, die → sie, das → es. Phân biệt sie (họ) với Sie (kính ngữ).",
    estimatedTime: "20 phút",
    theory: {
      intro: "Khi không muốn lặp lại danh từ, tiếng Đức dùng <strong>đại từ nhân xưng</strong> (Personalpronomen). Đại từ phải khớp với <strong>giống ngữ pháp</strong> (Genus) và <strong>số</strong> (Numerus) của danh từ được thay thế — không dựa vào giới tính thật của người hay vật.",
      sections: [
        {
          title: "1. Bảng đại từ nhân xưng (Nominativ)",
          description: "Đây là 9 đại từ cơ bản nhất. Học thuộc bảng này trước khi học bất cứ điều gì khác:",
          table: {
            headers: ["Ngôi", "Đại từ", "Nghĩa", "Ví dụ"],
            rows: [
              ["1. số ít", "ich", "tôi", "Ich lerne Deutsch."],
              ["2. số ít (thân mật)", "du", "bạn", "Woher kommst du?"],
              ["3. số ít (giống đực)", "er", "anh ấy, ông ấy, nó", "Er ist Lehrer."],
              ["3. số ít (giống cái)", "sie", "cô ấy, bà ấy, nó", "Sie ist Ärztin."],
              ["3. số ít (giống trung)", "es", "nó", "Es ist kalt."],
              ["1. số nhiều", "wir", "chúng tôi", "Wir lernen zusammen."],
              ["2. số nhiều (thân mật)", "ihr", "các bạn", "Seid ihr fertig?"],
              ["3. số nhiều", "sie", "họ", "Sie kommen aus Berlin."],
              ["Kính ngữ", "Sie", "Ngài, quý vị", "Wie heißen Sie?"]
            ]
          },
          notes: [
            "Chú ý: 'sie' xuất hiện hai lần — một là 'cô ấy', một là 'họ'. Ngữ cảnh và cách chia động từ cho biết đó là ngôi nào.",
            "'Sie' kính ngữ luôn viết hoa chữ S, kể cả khi đứng giữa câu."
          ]
        },
        {
          title: "2. Quy tắc thay danh từ bằng đại từ",
          description: "Đại từ thay thế phụ thuộc vào <strong>mạo từ</strong> của danh từ, không phụ thuộc vào giới tính thật:",
          table: {
            headers: ["Mạo từ", "Đại từ thay thế", "Ví dụ"],
            rows: [
              ["der (giống đực)", "er", "Der Mann kommt. → Er kommt."],
              ["die (giống cái)", "sie", "Die Frau kommt. → Sie kommt."],
              ["das (giống trung)", "es", "Das Kind spielt. → Es spielt."],
              ["die (số nhiều)", "sie", "Die Kinder spielen. → Sie spielen."]
            ]
          },
          notes: [
            "Ba cặp cần thuộc lòng: <strong>der → er</strong>, <strong>die → sie</strong>, <strong>das → es</strong>.",
            "Số nhiều luôn dùng 'sie', bất kể danh từ gốc giống gì: die Kinder → sie, die Männer → sie.",
            "Đại từ theo giống ngữ pháp, không theo giới tính thật: das Mädchen (cô gái) → es."
          ]
        },
        {
          title: "3. sie (họ) và Sie (kính ngữ) — chỉ khác một chữ S",
          description: "Đây là lỗi rất phổ biến khi mới học, vì cả hai đều viết là 'sie/sie'. Phân biệt bằng chữ hoa và ngữ cảnh:",
          rules: [
            "<strong>sie</strong> (viết thường) = cô ấy / họ.",
            "<strong>Sie</strong> (viết hoa) = Ngài / quý vị — dùng với người lạ, người lớn tuổi, trong công việc, khi mua bán.",
            "Kính ngữ 'Sie' chia động từ như ngôi 'sie' số nhiều: Wie heißen Sie? / Haben Sie Fragen? / Kommen Sie aus Vietnam?",
            "<strong>du</strong> dùng với bạn bè, gia đình, người cùng lứa; <strong>ihr</strong> dùng khi nói với một nhóm bạn."
          ]
        }
      ]
    }
  },
  {
    id: "a1-word-order",
    level: "A1",
    topic: "Trật tự từ",
    questionTopic: "word-order",
    unitId: "unit-3",
    prerequisites: ["a1-questions"],
    competencies: [
      "Giữ động từ ở vị trí thứ 2",
      "Đảo chủ ngữ khi trạng từ đứng đầu câu"
    ],
    title: "Trật tự từ trong câu (Satzstellung)",
    summary: "Động từ chia luôn ở vị trí thứ 2 trong câu khẳng định; khi trạng từ đứng đầu câu, chủ ngữ chuyển ra sau động từ.",
    estimatedTime: "25 phút",
    theory: {
      intro: "Tiếng Đức có một quy tắc chi phối gần như mọi câu: <strong>động từ chia luôn đứng ở vị trí thứ 2</strong> trong câu khẳng định. Hiểu quy tắc này là bạn dựng được câu đúng mà không cần học thuộc từng mẫu câu.",
      sections: [
        {
          title: "1. Câu khẳng định: chủ ngữ — động từ — phần còn lại",
          description: "Trật tự cơ bản nhất: chủ ngữ ở vị trí 1, động từ chia ở vị trí 2, các thành phần khác theo sau:",
          table: {
            headers: ["Câu", "Vị trí 1", "Vị trí 2", "Phần còn lại"],
            rows: [
              ["Ich lerne heute Deutsch.", "Ich", "lerne", "heute Deutsch."],
              ["Wir wohnen in Berlin.", "Wir", "wohnen", "in Berlin."],
              ["Du sprichst gut Deutsch.", "Du", "sprichst", "gut Deutsch."]
            ]
          },
          notes: [
            "Trạng từ chỉ thời gian (heute, morgen, jeden Tag) thường đứng ngay sau động từ.",
            "Sai thường gặp: 'Ich heute lerne Deutsch.' — động từ bị đẩy khỏi vị trí 2."
          ]
        },
        {
          title: "2. Trạng từ đứng đầu câu: động từ vẫn ở vị trí 2, chủ ngữ ra sau",
          description: "Muốn nhấn mạnh thời gian hoặc địa điểm, hãy đưa trạng từ lên đầu câu. Động từ <strong>giữ nguyên vị trí 2</strong>, và chủ ngữ chuyển ra ngay sau động từ:",
          table: {
            headers: ["Câu", "Vị trí 1", "Vị trí 2", "Vị trí 3"],
            rows: [
              ["Heute lerne ich Deutsch.", "Heute", "lerne", "ich"],
              ["Morgen gehe ich in die Schule.", "Morgen", "gehe", "ich"],
              ["Jeden Tag trinke ich Kaffee.", "Jeden Tag", "trinke", "ich"]
            ]
          },
          notes: [
            "Sai thường gặp: 'Morgen ich gehe in die Schule.' — chủ ngữ không được chen vào vị trí 2.",
            "Mẹo: đổi vị trí 1 thì chủ ngữ và động từ đổi chỗ cho nhau, phần còn lại giữ nguyên."
          ]
        },
        {
          title: "3. Câu hỏi: Ja/Nein-Fragen và W-Fragen",
          description: "Câu hỏi cũng tuân theo trật tự từ riêng, nhưng động từ vẫn không rời khỏi vị trí 1 hoặc 2:",
          table: {
            headers: ["Loại câu", "Vị trí 1", "Vị trí 2", "Ví dụ"],
            rows: [
              ["Ja/Nein-Frage", "Động từ", "Chủ ngữ", "Sprichst du Deutsch?"],
              ["W-Frage", "Từ W-", "Động từ", "Wo wohnst du?"],
              ["W-Frage", "Từ W-", "Động từ", "Was machst du?"]
            ]
          },
          rules: [
            "<strong>Ja/Nein-Frage</strong>: động từ đứng đầu câu, chủ ngữ ngay sau — Sprichst du Deutsch? / Ist er Lehrer?",
            "<strong>W-Frage</strong>: từ để hỏi ở vị trí 1, động từ ở vị trí 2, chủ ngữ ở vị trí 3 — Wo wohnst du? / Wie heißt du?",
            "Không đặt chủ ngữ trước động từ trong W-Frage: 'Wo du wohnst?' là sai, phải là 'Wo wohnst du?'."
          ]
        }
      ]
    }
  }
];
