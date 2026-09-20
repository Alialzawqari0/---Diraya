import React, { useState } from "react";
import {
  Bookmark,
  Check,
  ArrowUp,
  BookOpen,
  ChevronLeft,
  Search,
  Folder,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { toArabicIndic } from "../lib/utils";

export const StyleguideView: React.FC = () => {
  const [composerValue, setComposerValue] = useState("");
  const [isSavedDemo, setIsSavedDemo] = useState(false);

  const colors = [
    { name: "Parchment", token: "--color-parchment", hex: "#faf8f5", bgClass: "bg-parchment", border: true },
    { name: "Soft Paper", token: "--color-soft-paper", hex: "#fdfbfa", bgClass: "bg-soft-paper", border: true },
    { name: "Warm Mist", token: "--color-warm-mist", hex: "#d1d1cd", bgClass: "bg-warm-mist", border: false },
    { name: "Ash", token: "--color-ash", hex: "#92918b", bgClass: "bg-ash", border: false },
    { name: "Graphite", token: "--color-graphite", hex: "#72706b", bgClass: "bg-graphite", border: false },
    { name: "Ink", token: "--color-ink", hex: "#27251e", bgClass: "bg-ink", border: false },
    { name: "Pure Black", token: "--color-pure-black", hex: "#000000", bgClass: "bg-pure-black", border: false },
    { name: "Deep Teal", token: "--color-deep-teal", hex: "#016a71", bgClass: "bg-deep-teal", border: false },
  ];

  const spacingScale = [
    { name: "spacing-4", px: "4px", classDemo: "p-4" },
    { name: "spacing-8", px: "8px", classDemo: "p-8" },
    { name: "spacing-12", px: "12px", classDemo: "p-12" },
    { name: "spacing-16", px: "16px", classDemo: "p-16" },
    { name: "spacing-32", px: "32px", classDemo: "p-32" },
  ];

  const radii = [
    { name: "rounded-md", px: "6px", classDemo: "rounded-md" },
    { name: "rounded-xl", px: "12px", classDemo: "rounded-xl" },
    { name: "rounded-2xl", px: "16px", classDemo: "rounded-2xl" },
    { name: "rounded-full", px: "9999px", classDemo: "rounded-full" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-parchment text-ink p-16 md:p-32" dir="rtl">
      <div className="max-w-4xl mx-auto flex flex-col gap-32">
        {/* Header */}
        <div className="border-b border-warm-mist pb-16 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-title font-semibold text-pure-black leading-diacritics">
              دِلِيلُ التَّصْمِيمِ — دِرَايَة (Styleguide)
            </h1>
            <span className="text-caption font-medium text-graphite bg-soft-paper border border-warm-mist px-8 py-4 rounded-md">
              بيئة التطوير
            </span>
          </div>
          <p className="text-body text-graphite">
            مراجعة بصرية شاملة لجميع الرموز التصميمية (Tokens)، الأوزان، المقاسات، والبطاقات وفق المواصفة القياسية.
          </p>
        </div>

        {/* 1. Color Palette */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ١. الألوان المعتمدة (Color Tokens)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
            {colors.map((c) => (
              <div
                key={c.name}
                className="bg-soft-paper border border-warm-mist rounded-xl p-12 flex flex-col gap-8"
              >
                <div
                  className={`h-48 w-full rounded-md ${c.bgClass} ${
                    c.border ? "border border-warm-mist" : ""
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-body font-medium text-ink">{c.name}</span>
                  <span className="text-body-sm text-graphite font-normal">{c.token}</span>
                  <span className="text-caption text-ash font-normal">{c.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Typography Scale */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ٢. المقياس الطباعي (Typography Scale) — خط Cairo
          </h2>
          <div className="bg-soft-paper border border-warm-mist rounded-xl p-16 flex flex-col gap-16">
            <div className="flex flex-col gap-4 border-b border-warm-mist pb-12">
              <div className="flex items-baseline justify-between">
                <span className="text-caption text-graphite">text-title (24px, 1.4) — العناوين الرئيسية والترحيب</span>
                <span className="text-caption text-ash">font-semibold (600)</span>
              </div>
              <p className="text-title font-semibold text-pure-black leading-diacritics">
                بِمَاذَا تَبْحَثُ الْيَوْمَ فِي كُتُبِ التَّفْسِيرِ؟
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-warm-mist pb-12">
              <div className="flex items-baseline justify-between">
                <span className="text-caption text-graphite">text-body-lg (16px, 1.43) — العناوين الفرعية ونصوص التفسير</span>
                <span className="text-caption text-ash">font-normal (400) / font-semibold (600)</span>
              </div>
              <p className="text-body-lg font-semibold text-ink">
                سُورَةُ الْبَقَرَةِ — قَوْلُ الْمُفَسِّرِينَ فِي آيَةِ الْكُرْسِيِّ
              </p>
              <p className="text-body-lg font-normal text-ink leading-reading">
                هذه الآية الكريمة سيدة آي القرآن، مشتملة على عشر جمل مستقلة، كل جملة تدل على كمال من كمالات الله تعالى وعظمته في سلطانه.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-warm-mist pb-12">
              <div className="flex items-baseline justify-between">
                <span className="text-caption text-graphite">text-body (14px, 1.43) — النص الأساسي وعناصر القوائم</span>
                <span className="text-caption text-ash">font-normal (400) / font-medium (500)</span>
              </div>
              <p className="text-body font-normal text-ink">
                أداة بحث ومقارنة بين نصوص التفاسير المعتمدة الميسرة وتفسير السعدي وابن كثير.
              </p>
              <p className="text-body font-medium text-ink">
                نص تفاعلي يمثل زر أو عنصر قائمة محدد (وزن ٥٠٠).
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-warm-mist pb-12">
              <div className="flex items-baseline justify-between">
                <span className="text-caption text-graphite">text-body-sm (12px, 1.43) — النصوص الثانوية وأسماء المؤلفين</span>
                <span className="text-caption text-ash">font-medium (500) / font-normal (400)</span>
              </div>
              <p className="text-body-sm text-graphite font-medium">
                عبد الرحمن بن ناصر السعدي (ت: ١٣٧٦ هـ) — المجلد الأول
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-warm-mist pb-12">
              <div className="flex items-baseline justify-between">
                <span className="text-caption text-graphite">text-caption (11px, 1.43) — الشارات وتواريخ الأيام والعدادات</span>
                <span className="text-caption text-ash">font-normal (400)</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-caption text-graphite">اليوم</span>
                <span className="text-caption text-graphite">أمس</span>
                <span className="text-caption text-ash border border-dashed border-warm-mist px-8 py-4 rounded-md">
                  نص تجريبي
                </span>
                <span className="text-caption text-graphite">
                  {toArabicIndic(4)} محادثات
                </span>
              </div>
            </div>

            {/* Quran Verse Typography */}
            <div className="flex flex-col gap-8 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-caption text-graphite">خط الآيات القرآنية — Amiri Quran (26px, 2.2 leading)</span>
                <span className="text-caption text-ash">حفظ علامات الضبط والوقف</span>
              </div>
              <div className="bg-parchment border border-warm-mist rounded-xl p-16 text-center">
                <p className="font-quran text-verse leading-verse text-ink">
                  ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ﴿٢٥٥﴾
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Spacing & Radii Scales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Spacing */}
          <div className="flex flex-col gap-12">
            <h2 className="text-body-lg font-semibold text-ink">
              ٣. مقياس المسافات (Spacing Scale)
            </h2>
            <div className="bg-soft-paper border border-warm-mist rounded-xl p-16 flex flex-col gap-12">
              {spacingScale.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <span className="text-body font-medium text-ink">{s.name}</span>
                    <span className="text-caption text-graphite">({s.px})</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-caption text-ash">{s.classDemo}</span>
                    <div
                      className="bg-deep-teal rounded-md"
                      style={{ width: s.px, height: "16px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radii */}
          <div className="flex flex-col gap-12">
            <h2 className="text-body-lg font-semibold text-ink">
              ٤. مقياس التدوير (Radius Scale)
            </h2>
            <div className="bg-soft-paper border border-warm-mist rounded-xl p-16 flex flex-col gap-12">
              {radii.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <span className="text-body font-medium text-ink">{r.name}</span>
                    <span className="text-caption text-graphite">({r.px})</span>
                  </div>
                  <div
                    className={`h-32 w-48 bg-warm-mist/45 border border-warm-mist flex items-center justify-center text-caption text-ink ${r.classDemo}`}
                  >
                    عرض
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Interactive Buttons & Toast */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ٥. الأزرار والتفاعلات (Buttons & States)
          </h2>
          <div className="bg-soft-paper border border-warm-mist rounded-xl p-16 flex flex-col gap-16">
            <div className="flex flex-wrap items-center gap-12">
              {/* Primary */}
              <button
                type="button"
                className="h-36 px-16 rounded-md bg-deep-teal text-soft-paper font-medium text-body hover:opacity-95 transition-opacity"
              >
                زر رئيسي (Primary)
              </button>

              {/* Ghost / Secondary */}
              <button
                type="button"
                className="h-36 px-16 rounded-md border border-warm-mist bg-transparent text-ink font-medium text-body hover:bg-warm-mist/35 transition-colors"
              >
                زر ثانوي (Ghost)
              </button>

              {/* Dense 32px */}
              <button
                type="button"
                className="h-32 px-12 rounded-md border border-warm-mist bg-transparent text-ink font-medium text-body-sm hover:bg-warm-mist/35 transition-colors"
              >
                زر مصغر (Dense 32px)
              </button>

              {/* Disabled */}
              <button
                type="button"
                disabled
                className="h-36 px-16 rounded-md bg-warm-mist text-ash font-medium text-body cursor-not-allowed"
              >
                معطل (Disabled)
              </button>

              {/* Saved Toggle State */}
              <button
                type="button"
                onClick={() => setIsSavedDemo(!isSavedDemo)}
                className={`h-32 px-12 rounded-md font-medium text-body-sm transition-colors flex items-center gap-4 ${
                  isSavedDemo
                    ? "bg-deep-teal/8 text-deep-teal border border-deep-teal/20"
                    : "border border-warm-mist bg-transparent text-graphite hover:bg-warm-mist/35"
                }`}
              >
                {isSavedDemo ? (
                  <>
                    <Check className="size-14 text-deep-teal" />
                    <span>تم الحفظ</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="size-14 text-graphite" />
                    <span>حفظ التفسير</span>
                  </>
                )}
              </button>

              {/* Toast Trigger */}
              <button
                type="button"
                onClick={() => {
                  toast("تم حفظ التفسير في مشروعك الحالي", {
                    action: {
                      label: "تراجع",
                      onClick: () => toast("تم التراجع عن الحفظ"),
                    },
                  });
                }}
                className="h-36 px-16 rounded-md bg-deep-teal text-soft-paper font-medium text-body hover:opacity-95 transition-opacity"
              >
                تجربة إشعار (Sonner Toast)
              </button>
            </div>
          </div>
        </div>

        {/* 5. Verse Card Specification */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ٦. بطاقة الآية الكريمة (Verse Card)
          </h2>
          <div className="bg-soft-paper border border-warm-mist rounded-2xl p-16 md:p-32 flex flex-col items-center gap-16">
            <span className="rounded-full bg-soft-paper border border-warm-mist px-12 py-4 text-caption text-graphite font-normal">
              سورة البقرة، الآية ٢٥٥
            </span>
            <p className="font-quran text-verse leading-verse text-ink text-center max-w-2xl">
              ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ﴿٢٥٥﴾
            </p>
          </div>
        </div>

        {/* 6. Tafsir Card Specification */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ٧. بطاقة التفسير (Tafsir Card)
          </h2>
          <div className="bg-soft-paper border border-warm-mist rounded-xl p-16 flex flex-col gap-12">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-warm-mist pb-12">
              <div className="flex items-center gap-8">
                <span className="text-body font-semibold text-ink">تيسير الكريم الرحمن (تفسير السعدي)</span>
                <span className="text-caption text-ash border border-dashed border-warm-mist rounded-md px-8 py-4">
                  نص تجريبي
                </span>
              </div>
              <span className="text-body-sm text-graphite font-normal">عبد الرحمن بن ناصر السعدي</span>
            </div>

            {/* Body */}
            <p className="text-body-lg text-ink font-normal leading-reading text-start">
              هذه الآية الكريمة أعظم آيات القرآن وأجلها وأفضلها، لما اشتملت عليه من الأمور العظيمة والصفات الكريمة. فأخبر تعالى أنه المتفرد بالألوهية، وأنه الحي القيوم المتضمن لجميع صفات الكمال، فلا يلحقه نقص ولا سنة ولا نوم.
            </p>

            {/* Footer */}
            <div className="border-t border-warm-mist pt-12 flex items-center justify-between">
              <span className="text-body-sm text-graphite">البقرة: ٢٥٥ — ص ٥٤</span>
              <button
                type="button"
                className="h-32 px-12 rounded-md border border-warm-mist bg-transparent text-graphite hover:bg-warm-mist/35 font-medium text-body-sm flex items-center gap-4 transition-colors"
              >
                <Bookmark className="size-14 text-graphite" />
                <span>حفظ التفسير</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7. Composer Specification */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ٨. شريط الإدخال ومحدد التفاسير (Composer & Controls)
          </h2>
          <div className="max-w-composer w-full mx-auto bg-soft-paper border border-warm-mist rounded-2xl shadow-subtle p-12 md:p-16 flex flex-col gap-12 focus-within:border-deep-teal transition-colors">
            <textarea
              rows={2}
              value={composerValue}
              onChange={(e) => setComposerValue(e.target.value)}
              placeholder="اكتب آية أو كلمة للبحث في كتب التفسير المعتمدة..."
              className="w-full bg-transparent text-body-lg text-ink placeholder:text-ash resize-none border-0 focus:outline-none leading-diacritics"
            />
            <div className="flex items-center justify-between pt-8 border-t border-warm-mist">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  className="h-32 px-12 rounded-md border border-warm-mist text-graphite hover:bg-warm-mist/35 font-medium text-body-sm flex items-center gap-4 transition-colors"
                >
                  <BookOpen className="size-14 text-graphite" />
                  <span>التفاسير المحددة (٤)</span>
                </button>
              </div>
              <button
                type="button"
                disabled={!composerValue.trim()}
                className={`size-32 rounded-full flex items-center justify-center transition-colors ${
                  composerValue.trim()
                    ? "bg-deep-teal text-soft-paper cursor-pointer"
                    : "bg-warm-mist text-ash cursor-not-allowed"
                }`}
              >
                <ArrowUp className="size-16" />
              </button>
            </div>
          </div>
        </div>

        {/* 8. Menu / Popover Specification */}
        <div className="flex flex-col gap-12">
          <h2 className="text-body-lg font-semibold text-ink">
            ٩. القوائم والمنبثقات (Menus & Dropdowns)
          </h2>
          <div className="w-64 bg-soft-paper border border-warm-mist rounded-xl shadow-subtle p-4 flex flex-col gap-4">
            <button
              type="button"
              className="h-32 px-12 rounded-md text-body text-ink hover:bg-warm-mist/35 flex items-center justify-between text-start transition-colors"
            >
              <span>الملف الشخصي</span>
              <ChevronLeft className="size-14 text-graphite" />
            </button>
            <button
              type="button"
              className="h-32 px-12 rounded-md text-body text-ink hover:bg-warm-mist/35 flex items-center justify-between text-start transition-colors"
            >
              <span>التفاسير المفضلة</span>
              <BookOpen className="size-14 text-graphite" />
            </button>
            <div className="border-t border-warm-mist my-4" />
            <button
              type="button"
              className="h-32 px-12 rounded-md text-body text-ink hover:bg-warm-mist/35 flex items-center justify-between text-start transition-colors"
            >
              <span>حذف المحادثة</span>
              <Trash2 className="size-14 text-graphite" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
