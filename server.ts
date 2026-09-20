import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { searchQuranDigitalLibrary } from "./src/lib/quranLibrary";
import { MESSAGES, SUGGESTIONS, ROUTER_SYSTEM_PROMPT } from "./src/messages";
import { classifyQueryLocally, classifyQueryWithGemini, RouterOutput } from "./src/lib/queryRouter";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Tafsir books catalog
const TAFSIR_CATALOG = [
  { id: "tabari", name: "جامع البيان (تفسير الطبري)", author: "ابن جرير الطبري (ت ٣١٠ هـ)" },
  { id: "ibn_kathir", name: "تفسير القرآن العظيم (ابن كثير)", author: "ابن كثير (ت ٧٧٤ هـ)" },
  { id: "saadi", name: "تيسير الكريم الرحمن (تفسير السعدي)", author: "عبد الرحمن بن ناصر السعدي (ت ١٣٧٦ هـ)" },
  { id: "muyassar", name: "التفسير الميسر", author: "مجمع الملك فهد لطباعة المصحف الشريف" },
];

// Curated fallback data for offline/demo reliability
const CURATED_FALLBACKS: Record<string, any> = {
  kursi: {
    ayah: {
      surah: "سورة البقرة",
      ayahFrom: 255,
      ayahTo: 255,
      text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    },
    leadLine: "عرض نصوص التفسير الواردة في آية الكرسي من كتب التفسير المعتمدة الموثقة عبر محرك البحث:",
    tafsirs: [
      {
        bookId: "tabari",
        ayahRef: "البقرة: ٢٥٥",
        text: "يورد الطبري في تأويل قوله تعالى ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾ الآثار المسندة عن الصحابة والتابعين في بيان عظمة أسماء الله وصفاته، ويوضح معنى القيوم بأنه القائم بتدبير خلقه، مع تفصيل الروايات في دلالة الكرسي وسعته للسماوات والأرض وأنه موضع القدمين والعرش أعظم منه.",
      },
      {
        bookId: "ibn_kathir",
        ayahRef: "البقرة: ٢٥٥",
        text: "يذكر ابن كثير فضائل هذه الآية الكريمة وأنها سيدة آي القرآن وأعظم آية في كتاب الله، مبيناً اشتمالها على عشر جمل مستقلة في توحيد الإلهية والربوبية ونفي السنة والنوم، شارحاً تفسير القرآن بالقرآن وما صح في السنة النبوية المطهرة.",
      },
      {
        bookId: "saadi",
        ayahRef: "البقرة: ٢٥٥",
        text: "يوضح الشيخ السعدي أن هذه الآية احتوت على توحيد الأسماء والصفات وأحاطت ببيان كمال ملكه وعظمته وسعة علمه المحيط بكل الغيب والشهادة، وأن حفظ السماوات والأرض لا يثقله ولا يكرثه سبحانه لعظم قدرته.",
      },
      {
        bookId: "muyassar",
        ayahRef: "البقرة: ٢٥٥",
        text: "الله الذي لا معبود بحق إلا هو، الحي القيوم القائم على شؤون خلقه، لا يلحقه نعاس ولا نوم، له ما في السماوات والأرض ملكاً وتصرفاً، وسع كرسيه السماوات والأرض ولا يثقله حفظهما وهو العلي بذاته وقدره العظيم بسلطانه.",
      },
    ],
    groundingSources: [
      { title: "مصحف جامعة الملك سعود - تفسير آية الكرسي", url: "https://quran.ksu.edu.sa/tafseer/tabary/sura2-aya255.html", domain: "quran.ksu.edu.sa" },
      { title: "الدرر السنية - الموسوعة القرآنية - تفسير البقرة ٢٥٥", url: "https://dorar.net/tafseer/2/255", domain: "dorar.net" },
      { title: "مشروع المصحف الإلكتروني - مجمع الملك فهد", url: "https://qurancomplex.gov.sa/", domain: "qurancomplex.gov.sa" },
    ],
  },
  sabr: {
    ayah: {
      surah: "سورة البقرة",
      ayahFrom: 153,
      ayahTo: 153,
      text: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    },
    leadLine: "عرض نصوص التفسير في الاستعانة بالصبر والصلاة ومعية الله لأهل الصبر:",
    tafsirs: [
      {
        bookId: "tabari",
        ayahRef: "البقرة: ١٥٣",
        text: "يقول الطبري: أمر الله تعالى المؤمنين في هذه الآية أن يستعينوا على ما كلفهم من الطاعات وعلى ما نابهم من نوائب الدهر بالصبر على طاعته وحبس النفس عن محارمه، وبالصلاة التي هي أعظم القربات، وأخبرهم أن معونته وتأييده مع من صبر.",
      },
      {
        bookId: "ibn_kathir",
        ayahRef: "البقرة: ١٥٣",
        text: "يبين ابن كثير أن الصبر نوعان: صبر على ترك المحارم والآثام، وصبر على فعل الطاعات والقربات، وثالث على المصائب والنوائب، وقرنه بالصلاة لأنها أكبر عون على الثبات كما كان النبي ﷺ إذا حزبه أمر فزع إلى الصلاة.",
      },
      {
        bookId: "saadi",
        ayahRef: "البقرة: ١٥٣",
        text: "يرشد السعدي إلى أن الصبر حبس النفس على ما تكره ابتغاء مرضاة الله، والمعية هنا معية خاصة تقتضي النصر والتأييد والتوفيق والهداية.",
      },
      {
        bookId: "muyassar",
        ayahRef: "البقرة: ١٥٣",
        text: "يا أيها الذين صدقوا الله ورسوله، استعينوا على طاعة الله ومواجهة الشدائد بالصبر وحبس النفس، وبالصلاة الجامعة لألوان العبودية، إن الله مع الصابرين بعونه وتوفيقه.",
      },
    ],
    groundingSources: [
      { title: "تفسير سورة البقرة آية ١٥٣ - جامع البيان للطبري", url: "https://quran.ksu.edu.sa/tafseer/tabary/sura2-aya153.html", domain: "quran.ksu.edu.sa" },
      { title: "تفسير ابن كثير - سورة البقرة ١٥٣", url: "https://quran.ksu.edu.sa/tafseer/katheer/sura2-aya153.html", domain: "quran.ksu.edu.sa" },
    ],
  },
  fatiha: {
    ayah: {
      surah: "سورة الفاتحة",
      ayahFrom: 1,
      ayahTo: 7,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    },
    leadLine: "عرض أصول معاني سورة الفاتحة وأسماء الله فيها من كتب التفسير الأربعة المعتمدة:",
    tafsirs: [
      {
        bookId: "tabari",
        ayahRef: "الفاتحة: ١-٧",
        text: "يفصل الطبري معنى الحمد بأنه الشكر الخالص لله دون سائر ما يعبد من دونه، مبيناً أن رب العالمين هو مالك الخلق وسيدهم ومصلح أمرهم، ويورد الروايات في بيان الصراط المستقيم وتفسير المغضوب عليهم باليهود والضالين بالنصارى.",
      },
      {
        bookId: "ibn_kathir",
        ayahRef: "الفاتحة: ١-٧",
        text: "يوضح ابن كثير أن الفاتحة أم الكتاب والسبع المثاني والشفاء التام، متناولاً أسرار تقديم العبادة على الاستعانة ﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾ وأنها تجمع غاية الإخلاص وكمال التوكل.",
      },
      {
        bookId: "saadi",
        ayahRef: "الفاتحة: ١-٧",
        text: "يقرر السعدي أن هذه السورة الكريمة اشتملت على أنواع التوحيد الثلاثة: توحيد الربوبية، وتوحيد الإلهية، وتوحيد الأسماء والصفات، واشتملت على إثبات الجزاء والنبوة.",
      },
      {
        bookId: "muyassar",
        ayahRef: "الفاتحة: ١-٧",
        text: "سورة الفاتحة تفتتح بحمد الله والثناء عليه بصفات جلاله، ثم إعلان العبودية الخالصة له وسؤاله الهداية إلى الصراط المستقيم، صراط الذين أنعم الله عليهم من النبيين والصديقين والشهداء والصالحين.",
      },
    ],
    groundingSources: [
      { title: "تفسير سورة الفاتحة - موقع التفسير", url: "https://www.altafsir.com/", domain: "altafsir.com" },
      { title: "موسوعة التفسير المأثور - الدرر السنية", url: "https://dorar.net/tafseer/1", domain: "dorar.net" },
    ],
  },
};

// Search Tafsir with Query Routing + Quran Digital Library
app.post("/api/search-tafsir", async (req, res) => {
  const { query, selectedBookIds = ["muyassar", "saadi", "katheer", "baghawy", "ma3any"] } = req.body;

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "نص البحث مطلوب" });
  }

  const trimmedQuery = query.trim();

  // 1. CLASSIFY EVERY USER MESSAGE BEFORE ANSWERING (server-side, structured output)
  let classification: RouterOutput;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = getGeminiClient();
      classification = await classifyQueryWithGemini(ai, trimmedQuery);
    } catch (err: any) {
      console.warn("Gemini intent classifier skipped, using local router:", err?.message || err);
      classification = classifyQueryLocally(trimmedQuery);
    }
  } else {
    classification = classifyQueryLocally(trimmedQuery);
  }

  // 2. Handle Non-Search Intents with Exact Prescribed Arabic Messages
  if (classification.intent === "out_of_scope") {
    return res.json({
      intent: "out_of_scope",
      content: MESSAGES.OUT_OF_SCOPE,
      suggestions: [...SUGGESTIONS],
    });
  }

  if (classification.intent === "ruling_request") {
    return res.json({
      intent: "ruling_request",
      content: MESSAGES.RULING_REQUEST,
      suggestions: [],
    });
  }

  if (classification.intent === "about_app") {
    return res.json({
      intent: "about_app",
      content: MESSAGES.ABOUT_APP,
      suggestions: [...SUGGESTIONS],
    });
  }

  if (classification.intent === "distress") {
    return res.json({
      intent: "distress",
      content: MESSAGES.DISTRESS,
      suggestions: [],
    });
  }

  if (classification.intent === "no_result") {
    return res.json({
      intent: "no_result",
      content: MESSAGES.NO_RESULT,
      suggestions: [...SUGGESTIONS],
    });
  }

  // 3. For "search": run retrieval from tafsir sources
  const searchQuery = classification.surah
    ? `${classification.surah} ${classification.ayah_from || 1}`
    : classification.topic || trimmedQuery;

  let libraryResult = searchQuranDigitalLibrary(trimmedQuery, selectedBookIds);
  if (!libraryResult && searchQuery !== trimmedQuery) {
    libraryResult = searchQuranDigitalLibrary(searchQuery, selectedBookIds);
  }

  // If retrieval returns nothing (or impossible verse):
  // Never guess, never invent a verse or tafsir text -> treat as "no_result"
  if (!libraryResult) {
    return res.json({
      intent: "no_result",
      content: MESSAGES.NO_RESULT,
      suggestions: [...SUGGESTIONS],
    });
  }

  // Retrieval succeeded! Return strictly retrieved sources
  return res.json({
    intent: "search",
    ayah: libraryResult.ayah,
    leadLine: libraryResult.leadLine,
    tafsirs: libraryResult.tafsirs,
    groundingSources: libraryResult.groundingSources,
    searchQueries: [trimmedQuery],
  });
});

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "دِرَايَة",
    searchGrounding: !!process.env.GEMINI_API_KEY,
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`دِرَايَة server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
