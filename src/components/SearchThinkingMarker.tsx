import React, { useState, useEffect } from "react";
import { GitBranchIcon, SearchIcon, CheckCircle2, Globe2 } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";
import { toArabicIndic } from "@/lib/utils";

interface SearchThinkingMarkerProps {
  selectedBookCount: number;
}

export const SearchThinkingMarker: React.FC<SearchThinkingMarkerProps> = ({
  selectedBookCount,
}) => {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(2), 1700);
    const timer2 = setTimeout(() => setStage(3), 3500);
    const timer3 = setTimeout(() => setStage(4), 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full max-w-[580px] rounded-[8px] bg-[#080808] border border-[#212121] p-5 space-y-4 my-3 text-start animate-in fade-in-50 duration-300">
      {/* Stage 1: Exploring */}
      <Marker>
        <MarkerIcon className={stage > 1 ? "bg-[#ffffff] text-[#101010]" : "bg-[#212121] text-[#f3f3f3]"}>
          {stage > 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <SearchIcon className="h-3.5 w-3.5" />}
        </MarkerIcon>
        <MarkerContent>
          <span className="text-[13px] font-aeonik font-normal">البحث في آيات المصحف الشريف واستدعاء الموضع المطلوب</span>
        </MarkerContent>
      </Marker>

      {/* Stage 2: Thinking & Comparing Tafsirs */}
      {stage >= 2 && (
        <Marker role="status">
          <MarkerIcon className={stage > 2 ? "bg-[#ffffff] text-[#101010]" : "bg-[#212121] text-[#f3f3f3]"}>
            {stage > 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Spinner size="sm" />}
          </MarkerIcon>
          <MarkerContent className={stage === 2 ? "text-[#f3f3f3]" : ""}>
            <span className="text-[13px] font-aeonik font-normal">استدعاء ومقارنة نصوص {toArabicIndic(selectedBookCount)} تفاسير معتمدة (الطبري، ابن كثير، السعدي، الميسر)...</span>
          </MarkerContent>
        </Marker>
      )}

      {/* Stage 3: Google Search Grounding verification */}
      {stage >= 3 && (
        <Marker>
          <MarkerIcon className={stage > 3 ? "bg-[#ffffff] text-[#101010]" : "bg-[#212121] text-[#f3f3f3]"}>
            {stage > 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5 animate-pulse text-[#6f6759]" />}
          </MarkerIcon>
          <MarkerContent className={stage === 3 ? "text-[#f3f3f3]" : ""}>
            <span className="text-[13px] font-aeonik font-normal">المطابقة والتوثيق عبر محرك بحث Google ومصادر التفسير الرسمية...</span>
          </MarkerContent>
        </Marker>
      )}

      {/* Stage 4: Preparing final formatted cards */}
      {stage >= 4 && (
        <Marker>
          <MarkerIcon className="bg-[#ffffff] text-[#101010]">
            <GitBranchIcon className="h-3.5 w-3.5" />
          </MarkerIcon>
          <MarkerContent className="text-[#f3f3f3]">
            <span className="text-[13px] font-aeonik font-normal">اكتمل التوثيق — جارٍ عرض أقوال المفسرين في تبويبات مخصصة...</span>
          </MarkerContent>
        </Marker>
      )}
    </div>
  );
};
