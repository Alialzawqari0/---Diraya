import React from "react";
import { Ayah } from "../types";
import { toArabicIndic } from "../lib/utils";
import { motion } from "motion/react";

interface AyahCardProps {
  ayah: Ayah;
}

export const AyahCard: React.FC<AyahCardProps> = ({ ayah }) => {
  const isRange = ayah.ayahFrom !== ayah.ayahTo;
  const verseNumberText = isRange
    ? `الآيات ${toArabicIndic(ayah.ayahFrom)} - ${toArabicIndic(ayah.ayahTo)}`
    : `الآية ${toArabicIndic(ayah.ayahFrom)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-[8px] bg-[#080808] border border-[#212121] p-6 md:p-8 text-center"
    >
      {/* Surah & Ayah metadata label */}
      <div className="mb-4 text-[12px] font-input text-[#9c9c9c]">
        {ayah.surah}، {verseNumberText}
      </div>

      {/* Centered Quran Verse Text in Amiri Quran */}
      <div
        dir="rtl"
        className="font-quran text-[26px] md:text-[30px] font-normal leading-[2.2] md:leading-[2.4] text-[#f3f3f3] select-text px-2"
      >
        {ayah.text}
      </div>
    </motion.div>
  );
};
