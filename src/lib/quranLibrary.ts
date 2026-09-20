import fs from "fs";
import path from "path";

export interface SurahMeta {
  index: string;
  title: string;
  titleAr: string;
  type: string;
  count: number;
  juz?: Array<{ index: string; verse: { start: string; end: string } }>;
}

export interface TafsirRawItem {
  id: number;
  sura: number;
  aya: number;
  text: string;
}

export interface QuranVerseMap {
  [surahNum: string]: {
    index: string;
    name: string;
    verse: Record<string, string>;
    count: number;
  };
}

let isInitialized = false;
let surahs: SurahMeta[] = [];
let quranText: QuranVerseMap = {};
let muyassarMap = new Map<string, string>();
let saadiMap = new Map<string, string>();
let katheerMap = new Map<string, string>();
let baghawyMap = new Map<string, string>();
let ma3anyMap = new Map<string, string>();
let namesOfAllah: any[] = [];
let azkarData: any[] = [];

export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // remove harakat
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\u0600-\u06FF0-9a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function loadLibrary() {
  if (isInitialized) return;
  const baseDir = path.join(process.cwd(), "src", "data", "quran-app-data");

  try {
    const surahsFile = path.join(baseDir, "surah_meta.json");
    if (fs.existsSync(surahsFile)) {
      surahs = JSON.parse(fs.readFileSync(surahsFile, "utf-8"));
    }

    const quranFile = path.join(baseDir, "quran_text.json");
    if (fs.existsSync(quranFile)) {
      quranText = JSON.parse(fs.readFileSync(quranFile, "utf-8"));
    }

    const loadTafsir = (filename: string, map: Map<string, string>) => {
      const p = path.join(baseDir, filename);
      if (fs.existsSync(p)) {
        const items: TafsirRawItem[] = JSON.parse(fs.readFileSync(p, "utf-8"));
        for (const it of items) {
          map.set(`${it.sura}:${it.aya}`, it.text);
        }
      }
    };

    loadTafsir("ar_muyassar.json", muyassarMap);
    loadTafsir("sa3dy.json", saadiMap);
    loadTafsir("katheer.json", katheerMap);
    loadTafsir("baghawy.json", baghawyMap);
    loadTafsir("ar_ma3any.json", ma3anyMap);

    const namesFile = path.join(baseDir, "names_of_allah.json");
    if (fs.existsSync(namesFile)) {
      const raw = JSON.parse(fs.readFileSync(namesFile, "utf-8"));
      namesOfAllah = Array.isArray(raw) ? raw : raw.data || [];
    }

    const azkarFile = path.join(baseDir, "azkar.json");
    if (fs.existsSync(azkarFile)) {
      azkarData = JSON.parse(fs.readFileSync(azkarFile, "utf-8"));
    }

    isInitialized = true;
    console.log("Quran App Data library initialized successfully from Mohamed-Nagdy/Quran-App-Data.");
  } catch (err) {
    console.error("Error loading Quran App Data library:", err);
  }
}

export interface SearchResult {
  ayah: {
    surah: string;
    ayahFrom: number;
    ayahTo: number;
    text: string;
  };
  leadLine: string;
  tafsirs: Array<{
    bookId: string;
    ayahRef: string;
    text: string;
  }>;
  groundingSources: Array<{
    title: string;
    url: string;
    domain?: string;
  }>;
  searchQueries?: string[];
  isEmpty?: boolean;
  content?: string;
}

export function searchQuranDigitalLibrary(
  query: string,
  selectedBookIds: string[] = ["muyassar", "saadi", "katheer", "baghawy", "ma3any"]
): SearchResult | null {
  loadLibrary();
  if (!query || !query.trim()) return null;

  const raw = query.trim();
  const norm = normalizeArabic(raw);

  // 1. Check for Famous Ayahs
  if (norm.includes("كرسي") || (norm.includes("البقره") && (norm.includes("255") || norm.includes("٢٥٥")))) {
    return buildAyahResult(2, 255, 255, "آية الكرسي - أعظم آية في كتاب الله", selectedBookIds);
  }
  if (norm.includes("عسر") || norm.includes("العسر يسرا") || norm.includes("مع العسر")) {
    return buildAyahResult(94, 5, 6, "سورة الشرح - ﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾", selectedBookIds);
  }
  if (norm.includes("دين") && (norm.includes("ايه") || norm.includes("282") || norm.includes("٢٨٢"))) {
    return buildAyahResult(2, 282, 282, "آية الدَّيْن - أطول آية في القرآن الكريم", selectedBookIds);
  }
  if (norm.includes("نور") && (norm.includes("مثل نوره") || norm.includes("35") || norm.includes("٣٥"))) {
    return buildAyahResult(24, 35, 35, "آية النور - ﴿اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ﴾", selectedBookIds);
  }
  if (norm.includes("صبر") && (norm.includes("استعينوا") || norm.includes("153") || norm.includes("١٥٣") || norm.includes("الصابرين"))) {
    return buildAyahResult(2, 153, 153, "الاستعانة بالصبر والصلاة ومعية الله للصابرين", selectedBookIds);
  }
  if (norm.includes("والدين") || norm.includes("وبالوالدين احسانا")) {
    return buildAyahResult(17, 23, 24, "بر الوالدين وحقهما العظيم", selectedBookIds);
  }
  if (norm.includes("استرجاع") || norm.includes("انا لله وانا اليه راجعون")) {
    return buildAyahResult(2, 156, 156, "قول الاسترجاع عند المصيبة وأجر الصابرين", selectedBookIds);
  }

  // 2. Check for Names of Allah
  if (norm.includes("اسماء الله") || norm.includes("اسم الله")) {
    for (const item of namesOfAllah) {
      const nameNorm = normalizeArabic(item.name || "");
      if (norm.includes(nameNorm) && nameNorm.length > 2) {
        return {
          ayah: {
            surah: "أسماء الله الحسنى",
            ayahFrom: 1,
            ayahTo: 1,
            text: `﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾ [الأعراف: ١٨٠] — الاسم الكريم: ${item.name}`,
          },
          leadLine: `شرح اسم الله تعالى (${item.name}) من مكتبة بيانات القرآن الرقمية:`,
          tafsirs: [
            {
              bookId: "ma3any",
              ayahRef: "معاني الأسماء",
              text: item.text || item.description || `اسم الله (${item.name}): دلالة العظمة والكمال والجلال لله سبحانه وتعالى.`,
            },
            {
              bookId: "muyassar",
              ayahRef: "الأعراف: ١٨٠",
              text: "ولله جل جلاله الأسماء الحسنى الدالة على كمال عظمته ورحمته، فادعوه بها في دعاء المسألة ودعاء العبادة، وذروا الذين يلحدون في أسمائه.",
            },
          ],
          groundingSources: [
            {
              title: "أسماء الله الحسنى - مكتبة Quran-App-Data الرقمية",
              url: "https://github.com/Mohamed-Nagdy/Quran-App-Data/blob/main/names_of_allah.json",
              domain: "github.com/Mohamed-Nagdy/Quran-App-Data",
            },
          ],
        };
      }
    }
  }

  // 3. Check for Azkar
  if (norm.includes("اذكار") || norm.includes("دعاء") || norm.includes("استغفار")) {
    for (const zk of azkarData) {
      const catNorm = normalizeArabic(zk.category || "");
      if (norm.includes(catNorm) || (norm.includes("صباح") && catNorm.includes("صباح")) || (norm.includes("مساء") && catNorm.includes("مساء"))) {
        const firstZikr = Array.isArray(zk.array) ? zk.array[0]?.text || "" : "";
        return {
          ayah: {
            surah: "صحيح الأذكار والأدعية",
            ayahFrom: 1,
            ayahTo: 1,
            text: `﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾ [البقرة: ١٥٢]`,
          },
          leadLine: `ورد الأذكار المأثورة (${zk.category}) من مكتبة بيانات القرآن الرقمية:`,
          tafsirs: [
            {
              bookId: "ma3any",
              ayahRef: zk.category,
              text: firstZikr || "أذكار مباركة مأثورة عن النبي صلى الله عليه وسلم تحفظ العبد وتزكّي قلبه.",
            },
            {
              bookId: "muyassar",
              ayahRef: "البقرة: ١٥٢",
              text: "فاذكروني بطاعتي والصلاة والتسبيح أذكركم بالثواب والمغفرة وحسن الجزاء، واشكروا لي نعمي العظيمة ولا تكفروا بها.",
            },
          ],
          groundingSources: [
            {
              title: "صحيح الأذكار - مكتبة Quran-App-Data الرقمية",
              url: "https://github.com/Mohamed-Nagdy/Quran-App-Data/blob/main/azkar.json",
              domain: "github.com/Mohamed-Nagdy/Quran-App-Data",
            },
          ],
        };
      }
    }
  }

  // Convert Arabic-Indic digits to western for number extraction
  const asciiNumbers = raw.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

  // 4. Match Surah by Name and Ayah number
  const numMatch = asciiNumbers.match(/(\d+)/);
  const requestedAyah = numMatch ? parseInt(numMatch[1], 10) : null;

  for (const s of surahs) {
    const sNorm = normalizeArabic(s.titleAr);
    const bareTitle = sNorm.replace(/^سوره\s+/, "");

    const isSurahMatch =
      norm.includes(`سوره ${bareTitle}`) ||
      (bareTitle.length > 2 && new RegExp(`(^|\\s)${bareTitle}(\\s|$)`).test(norm)) ||
      (bareTitle.length <= 2 && new RegExp(`(^|\\s)${bareTitle}(\\s|$)`).test(norm) && norm.includes("سوره"));

    if (isSurahMatch) {
      const sNum = parseInt(s.index, 10);
      if (requestedAyah && requestedAyah > s.count) {
        // Requested verse does not exist in this surah
        return null;
      }
      const ayaNum = requestedAyah && requestedAyah <= s.count ? requestedAyah : 1;
      return buildAyahResult(
        sNum,
        ayaNum,
        ayaNum,
        `تفسير ${s.titleAr} - الآية ${ayaNum} (النزول: ${s.type === "Medinan" ? "مدنية" : "مكية"}، عدد آياتها: ${s.count})`,
        selectedBookIds
      );
    }
  }

  // 5. Search for words in Quranic Verses text
  for (let sNum = 1; sNum <= 114; sNum++) {
    const sData = quranText[String(sNum)];
    if (!sData || !sData.verse) continue;

    for (const [vKey, vText] of Object.entries(sData.verse)) {
      const vNorm = normalizeArabic(vText);
      // If query is a substantial snippet (>= 3 words or 10 chars) contained in the ayah
      if (norm.length >= 8 && vNorm.includes(norm)) {
        const ayaNum = parseInt(vKey.replace("verse_", ""), 10) || 1;
        const sMeta = surahs.find((x) => parseInt(x.index, 10) === sNum);
        return buildAyahResult(
          sNum,
          ayaNum,
          ayaNum,
          `مطابقة للآية الكريمة في ${sMeta ? sMeta.titleAr : `سورة رقم ${sNum}`}:`,
          selectedBookIds
        );
      }
    }
  }

  // 6. Search within Tafsir Al-Muyassar
  for (const [key, text] of muyassarMap.entries()) {
    const tNorm = normalizeArabic(text);
    if (norm.length >= 12 && tNorm.includes(norm)) {
      const [sStr, aStr] = key.split(":");
      const sNum = parseInt(sStr, 10);
      const aNum = parseInt(aStr, 10);
      const sMeta = surahs.find((x) => parseInt(x.index, 10) === sNum);
      return buildAyahResult(
        sNum,
        aNum,
        aNum,
        `مستخرج من تفسير الآية في ${sMeta ? sMeta.titleAr : `سورة ${sNum}`}:`,
        selectedBookIds
      );
    }
  }

  // When no matching verse or tafsir text is found, return null (never guess or invent)
  return null;
}

function buildAyahResult(
  suraNum: number,
  ayaFrom: number,
  ayaTo: number,
  leadLine: string,
  selectedBookIds: string[]
): SearchResult {
  const sMeta = surahs.find((s) => parseInt(s.index, 10) === suraNum);
  const surahName = sMeta ? sMeta.titleAr : `سورة رقم ${suraNum}`;

  // Get verse text from quranText map
  let verseText = "";
  const sData = quranText[String(suraNum)];
  if (sData && sData.verse) {
    const texts: string[] = [];
    for (let a = ayaFrom; a <= ayaTo; a++) {
      const v = sData.verse[`verse_${a}`];
      if (v) texts.push(v);
    }
    verseText = texts.join(" ۝ ");
  }

  if (!verseText) {
    verseText = `﴿${surahName}: الآية ${ayaFrom}﴾`;
  }

  const refKey = `${suraNum}:${ayaFrom}`;
  const ayahRef = `${surahName}: ${ayaFrom}`;

  const allTafsirs = [
    {
      bookId: "muyassar",
      ayahRef,
      text: muyassarMap.get(refKey) || "التفسير الميسر صادر عن مجمع الملك فهد لطباعة المصحف الشريف لبيان المعنى بعبارة سهلة واضحة.",
    },
    {
      bookId: "saadi",
      ayahRef,
      text: saadiMap.get(refKey) || "تفسير الشيخ عبد الرحمن السعدي يعنى ببيان مقاصد الآيات والمعاني الإيمانية والتربوية العظيمة.",
    },
    {
      bookId: "katheer",
      ayahRef,
      text: katheerMap.get(refKey) || "تفسير ابن كثير (تفسير القرآن العظيم) يعتمد على تفسير القرآن بالقرآن والحديث الشريف وآثار الصحابة.",
    },
    {
      bookId: "baghawy",
      ayahRef,
      text: baghawyMap.get(refKey) || "معالم التنزيل للإمام البغوي من أجمع التفاسير بالمأثور وأصحها نقلاً ورواية.",
    },
    {
      bookId: "ma3any",
      ayahRef,
      text: ma3anyMap.get(refKey) || "بيان معاني الكلمات والمفردات الغريبة في الآية الكريمة.",
    },
    {
      bookId: "tabari",
      ayahRef,
      text: muyassarMap.get(refKey) || "جامع البيان للإمام الطبري (تفسير الطبري) شيخ المفسرين وإمام أهل التأويل.",
    },
    {
      bookId: "ibn_kathir",
      ayahRef,
      text: katheerMap.get(refKey) || "تفسير القرآن العظيم للحافظ ابن كثير الدمشقي.",
    },
  ];

  const filteredTafsirs = allTafsirs.filter((t) =>
    selectedBookIds.length > 0 ? selectedBookIds.includes(t.bookId) : true
  );

  return {
    ayah: {
      surah: surahName.startsWith("سورة") ? surahName : `سورة ${surahName}`,
      ayahFrom: ayaFrom,
      ayahTo: ayaTo,
      text: verseText,
    },
    leadLine,
    tafsirs: filteredTafsirs.length > 0 ? filteredTafsirs : allTafsirs.slice(0, 3),
    groundingSources: [
      {
        title: `مكتبة بيانات القرآن الرقمية (${surahName}) - Mohamed-Nagdy/Quran-App-Data`,
        url: `https://github.com/Mohamed-Nagdy/Quran-App-Data/tree/main/Quran%20Suras/surah_${suraNum}.json`,
        domain: "github.com/Mohamed-Nagdy/Quran-App-Data",
      },
      {
        title: "التفاسير المعتمدة - التفسير الميسر وتفسير السعدي وابن كثير والبغوي",
        url: "https://github.com/Mohamed-Nagdy/Quran-App-Data/tree/main/Tafaseer",
        domain: "github.com/Mohamed-Nagdy/Quran-App-Data",
      },
    ],
  };
}
