import { GoogleGenAI } from "@google/genai";
import { MessageIntent, ROUTER_SYSTEM_PROMPT } from "../messages";
import { normalizeArabic, searchQuranDigitalLibrary, SearchResult } from "./quranLibrary";

export interface RouterOutput {
  intent: MessageIntent;
  surah?: string;
  ayah_from?: number;
  ayah_to?: number;
  topic?: string;
}

export interface RoutedResponse {
  intent: MessageIntent;
  content?: string;
  suggestions?: string[];
  ayah?: SearchResult["ayah"];
  leadLine?: string;
  tafsirs?: SearchResult["tafsirs"];
  groundingSources?: SearchResult["groundingSources"];
  searchQueries?: string[];
}

/**
 * Deterministic rules-based router for offline consistency, unit testing,
 * and high-speed fallback.
 */
export function classifyQueryLocally(query: string): RouterOutput {
  const trimmed = query.trim();
  const norm = normalizeArabic(trimmed);
  const asciiNumbers = trimmed.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

  // 1. Distress / Crisis detection
  const distressKeywords = [
    "انتحار",
    "انتحر",
    "اموت",
    "ابغي اموت",
    "ابغى اموت",
    "بموت",
    "اريد ان اموت",
    "اريد الموت",
    "انهاء حياتي",
    "اكتئاب شديد",
    "ضاقت بي الدنيا",
    "يئست من الحياة",
    "ما اقدر اتحمل",
    "ازمة نفسية",
    "مخنوق وابي اموت",
    "افكر في الانتحار",
  ];
  if (distressKeywords.some((k) => norm.includes(normalizeArabic(k)))) {
    return { intent: "distress" };
  }

  // 2. Ruling / Fatwa request (personal rulings, halal/haram, divorce, inheritance)
  const rulingKeywords = [
    "هل يجوز",
    "ما حكم",
    "ما الحكم",
    "هل حرام",
    "هل حلال",
    "حالتي كذا",
    "زوجي طلقني",
    "انا طلقت",
    "طلقت زوجتي",
    "طلاق",
    "ميراثي",
    "تقسيم الميراث",
    "كيف اقسم الميراث",
    "فتوى",
    "افتوني",
    "افتني",
    "هل اثم",
    "هل علي ذنب",
    "كفاره يمين",
    "هل صلاتي صحيحة",
    "هل صومي باطل",
  ];
  if (rulingKeywords.some((k) => norm.includes(normalizeArabic(k)))) {
    return { intent: "ruling_request" };
  }

  // 3. About app / Greetings / Capabilities
  const aboutKeywords = [
    "السلام عليكم",
    "سلام عليكم",
    "مرحبا",
    "اهلا",
    "صباح الخير",
    "مساء الخير",
    "من انت",
    "وش تسوي",
    "وش تسوون",
    "ماذا تفعل",
    "ما هو تطبيق درايه",
    "ما هي درايه",
    "عن درايه",
    "كيف استخدمك",
    "كيف تبحث",
    "مين انت",
    "وش انت",
    "شكرا",
    "جزاك الله خيرا",
    "يعطيك العافيه",
  ];
  // If the query is just a greeting or explicitly asking what Diraya is
  if (
    aboutKeywords.some((k) => norm === normalizeArabic(k) || norm.startsWith(normalizeArabic(k))) &&
    !norm.includes("تفسير") &&
    !norm.includes("ايه") &&
    !norm.includes("سوره")
  ) {
    return { intent: "about_app" };
  }

  // 4. Obvious impossible verse pattern (e.g. 999:999 or ٩٩٩:٩٩٩ or "لا وجود لها")
  if (
    norm.includes("لا وجود لها") ||
    asciiNumbers.includes("999") ||
    asciiNumbers.includes("888") ||
    asciiNumbers.includes("777")
  ) {
    return { intent: "no_result" };
  }

  // 5. Out of scope (Coding, Sports, Entertainment, Math, News, etc.)
  const outOfScopeKeywords = [
    "لاعب",
    "كره",
    "كرة",
    "كورة",
    "مباراه",
    "مباراة",
    "نادي",
    "ميسي",
    "رونالدو",
    "دوري",
    "كود",
    "برمجه",
    "برمجة",
    "بايثون",
    "python",
    "javascript",
    "جافاسكريبت",
    "html",
    "css",
    "sql",
    "كتابة كود",
    "اكتب لي برنامج",
    "سعر الدولار",
    "اسعار الذهب",
    "الطقس",
    "اخبار اليوم",
    "سياسه",
    "رئيس",
    "فيلم",
    "اغنيه",
    "نكتة",
    "نكته",
    "طبخ",
    "وصفه",
    "رياضيات",
    "معادله",
    "فيزياء",
  ];
  if (outOfScopeKeywords.some((k) => norm.includes(normalizeArabic(k)))) {
    return { intent: "out_of_scope" };
  }

  // 6. Explicit Quran / Tafsir references -> search
  const searchKeywords = [
    "تفسير",
    "سوره",
    "سورة",
    "ايه",
    "آية",
    "الكرسي",
    "الصبر",
    "الفاتحة",
    "البقرة",
    "ال عمران",
    "النساء",
    "المائدة",
    "الانعام",
    "الاعراف",
    "الانفال",
    "التوبة",
    "يونس",
    "هود",
    "يوسف",
    "الرعد",
    "ابراهيم",
    "الحجر",
    "النحل",
    "الاسراء",
    "الكهف",
    "مريم",
    "طه",
    "الانبياء",
    "الحج",
    "المؤمنون",
    "النور",
    "الفرقان",
    "الشعراء",
    "النمل",
    "القصص",
    "العنكبوت",
    "الروم",
    "لقمان",
    "السجدة",
    "الاحزاب",
    "سبأ",
    "فاطر",
    "يس",
    "الصافات",
    "ص",
    "الزمر",
    "غافر",
    "فصلت",
    "الشورى",
    "الزخرف",
    "الدخان",
    "الجاثية",
    "الاحقاف",
    "محمد",
    "الفتح",
    "الحجرات",
    "ق",
    "الذاريات",
    "الطور",
    "النجم",
    "القمر",
    "الرحمن",
    "الواقعة",
    "الحديد",
    "المجادلة",
    "الحشر",
    "الممتحنة",
    "الصف",
    "الجمعة",
    "المنافقون",
    "التغابن",
    "الطلاق",
    "التحريم",
    "الملك",
    "القلم",
    "الحاقة",
    "المعارج",
    "نوح",
    "الجن",
    "المزمل",
    "المدثر",
    "القيامة",
    "الانسان",
    "المرسلات",
    "النبأ",
    "النازعات",
    "عبس",
    "التكوير",
    "الانفطار",
    "المطففين",
    "الانشقاق",
    "البروج",
    "الطارق",
    "الاعلى",
    "الغاشية",
    "الفجر",
    "البلد",
    "الشمس",
    "الليل",
    "الضحى",
    "الشرح",
    "التين",
    "العلق",
    "القدر",
    "البينة",
    "الزلزلة",
    "العاديات",
    "القارعة",
    "التكاثر",
    "العصر",
    "الهمزة",
    "الفيل",
    "قريش",
    "الماعون",
    "الكوثر",
    "الكافرون",
    "النصر",
    "المسد",
    "الاخلاص",
    "الفلق",
    "الناس",
    "معنى قوله",
    "المفسرون",
    "المفسرين",
    "الطبري",
    "ابن كثير",
    "السعدي",
    "البغوي",
    "العسر يسرا",
    "اسماء الله",
    "اذكار",
  ];

  if (searchKeywords.some((k) => norm.includes(normalizeArabic(k)))) {
    return { intent: "search" };
  }

  // Default: tentative search; if retrieval returns nothing, it becomes no_result
  return { intent: "search" };
}

/**
 * Classify using Gemini model when available, using the VERBATIM system prompt.
 */
export async function classifyQueryWithGemini(
  ai: GoogleGenAI,
  query: string
): Promise<RouterOutput> {
  const prompt = `${ROUTER_SYSTEM_PROMPT}

User message: "${query.trim()}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  let raw = response.text || "";
  let jsonStr = raw.trim();
  if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
  else if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
  if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
  jsonStr = jsonStr.trim();

  const parsed = JSON.parse(jsonStr);
  return {
    intent: parsed.intent || "search",
    surah: parsed.surah,
    ayah_from: parsed.ayah_from,
    ayah_to: parsed.ayah_to,
    topic: parsed.topic,
  };
}
