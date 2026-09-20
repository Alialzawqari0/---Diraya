export const MESSAGES = {
  OUT_OF_SCOPE:
    "دِرَايَة أداة بحث مختصة في كتب التفسير، ولا تستطيع الحديث في مواضيع خارج ذلك. اسألني عن آية أو موضوع قرآني وسأبحث لك في التفاسير.",
  NO_RESULT:
    "لم أجد في التفاسير المتاحة نصاً يطابق طلبك. جرّب ذكر اسم السورة ورقم الآية، أو اكتب جزءاً من نص الآية.",
  RULING_REQUEST:
    "دِرَايَة لا تُفتي ولا تُصدر أحكاماً شخصية، وليست بديلاً عن أهل العلم. إن كان سؤالك متعلقاً بآية، فاذكرها وسأعرض لك ما قاله المفسرون عنها، وللحكم في مسألتك راجع أهل العلم.",
  ABOUT_APP:
    "أنا دِرَايَة، أداة بحث في كتب التفسير. أعرض لك ما قاله المفسرون عن الآية أو الموضوع بنصوصهم ومراجعهم، وأساعدك على حفظ ما تجده في مشاريع بحثية.",
  DISTRESS:
    "أسأل الله أن يفرّج عنك. دِرَايَة أداة بحث ولا تستطيع مساندتك في هذا، فأنصحك بالحديث مع شخص تثق به أو مختص يقف معك.",
} as const;

export const SUGGESTIONS = [
  "ما تفسير آية الكرسي؟",
  "ماذا قال المفسرون عن الصبر؟",
  "تفسير: إن مع العسر يسرا",
] as const;

export type MessageIntent =
  | "search"
  | "no_result"
  | "out_of_scope"
  | "ruling_request"
  | "about_app"
  | "distress";

export const ROUTER_SYSTEM_PROMPT =
  "You are the query router of Diraya, a search tool over Quran tafsir books. You do not answer questions yourself. Classify the user's message into one intent: search, no_result, out_of_scope, ruling_request, about_app, distress. Output JSON only: {intent, surah?, ayah_from?, ayah_to?, topic?}. For search, extract the verse reference or topic in standard Arabic even if the user wrote in dialect. Never add content of your own.";
