import React, { useState } from "react";
import { TafsirEntry, TafsirBook } from "../types";
import { Bookmark, Check, FolderPlus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { motion } from "motion/react";
import { LineByLineReveal } from "./LineByLineReveal";

interface TafsirCardProps {
  entry: TafsirEntry;
  book?: TafsirBook;
  chatProjectId?: string;
  ayahText: string;
  surah: string;
  ayahNumberText: string;
}

export const TafsirCard: React.FC<TafsirCardProps> = ({
  entry,
  book,
  chatProjectId,
  ayahText,
  surah,
  ayahNumberText,
}) => {
  const { projects, saveSource, unsaveSource, isSourceSaved, setIsNewProjectOpen } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Check if saved in the active chat project, or in any project
  const currentProjectId = chatProjectId || (projects.length > 0 ? projects[0].id : "");
  const isSavedInCurrent = currentProjectId ? isSourceSaved(currentProjectId, entry.ayahRef, entry.bookId) : false;

  const handleSaveToggle = (targetProjectId: string) => {
    if (isSourceSaved(targetProjectId, entry.ayahRef, entry.bookId)) {
      unsaveSource(targetProjectId, entry.ayahRef, entry.bookId);
    } else {
      saveSource({
        projectId: targetProjectId,
        ayahRef: entry.ayahRef,
        surah,
        ayahText,
        ayahNumberText,
        bookId: entry.bookId,
        bookName: book?.name || entry.bookId,
        author: book?.author || "",
        text: entry.text,
      });
    }
    setPickerOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-[8px] bg-[#080808] border border-[#212121] p-5 md:p-6"
    >
      {/* Header: Book Title, Author, and Badge */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-aeonik font-normal text-[#f3f3f3]">
              {book?.name || entry.bookId}
            </h3>
            <span className="inline-flex items-center rounded-[4.5px] bg-[#101010] border border-[#212121] px-2 py-0.5 text-[11px] font-input text-[#9c9c9c]">
              نص موثق
            </span>
          </div>
          <div className="mt-0.5 text-[12px] font-input text-[#9c9c9c]">
            {book?.author}
          </div>
        </div>
      </div>

      {/* Body text with progressive line-by-line reveal */}
      <div
        dir="rtl"
        className="typeset-docs text-[15px] text-[#c1c1c1] font-aeonik font-normal text-start pt-1 pb-4 select-text leading-relaxed"
      >
        <LineByLineReveal text={entry.text} />
      </div>

      {/* Subtle spacing divider */}
      <div className="h-px w-full bg-[#212121] my-2" />

      {/* Footer action: Save in project */}
      <div className="pt-2 flex items-center justify-between">
        {chatProjectId ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSaveToggle(chatProjectId)}
            className="h-8 gap-2 text-[12px] font-aeonik text-[#9c9c9c] hover:text-[#f3f3f3] hover:bg-[#212121] rounded-[4.5px]"
          >
            {isSavedInCurrent ? (
              <>
                <Check className="h-4 w-4 text-[#ffffff]" strokeWidth={1.5} />
                <span className="text-[#ffffff]">محفوظ في المشروع</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 text-[#6f6759]" strokeWidth={1.5} />
                <span>احفظ في المشروع</span>
              </>
            )}
          </Button>
        ) : (
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-[12px] font-aeonik text-[#9c9c9c] hover:text-[#f3f3f3] hover:bg-[#212121] rounded-[4.5px]"
              >
                {isSavedInCurrent ? (
                  <>
                    <Check className="h-4 w-4 text-[#ffffff]" strokeWidth={1.5} />
                    <span className="text-[#ffffff]">محفوظ</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 text-[#6f6759]" strokeWidth={1.5} />
                    <span>احفظ في المشروع</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2 bg-[#080808] border border-[#212121] rounded-[8px]">
              <div className="px-2 py-1 text-[12px] font-input text-[#9c9c9c]">
                اختر المشروع للحفظ:
              </div>
              {projects.length === 0 ? (
                <div className="p-2 text-center text-[13px] font-aeonik text-[#9c9c9c]">
                  لا توجد مشاريع حالياً.
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPickerOpen(false);
                      setIsNewProjectOpen(true);
                    }}
                    className="mt-2 w-full gap-1 text-[12px] font-aeonik rounded-[4.5px] border-[#212121] bg-[#101010] text-[#f3f3f3] hover:bg-[#212121]"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-[#6f6759]" strokeWidth={1.5} />
                    إنشاء مشروع جديد
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 mt-1">
                  {projects.map((proj) => {
                    const saved = isSourceSaved(proj.id, entry.ayahRef, entry.bookId);
                    return (
                      <button
                        key={proj.id}
                        onClick={() => handleSaveToggle(proj.id)}
                        className="flex items-center justify-between rounded-[4.5px] px-2 py-1.5 text-start text-[13px] font-aeonik text-[#f3f3f3] hover:bg-[#212121] transition-colors"
                      >
                        <span className="truncate">{proj.name}</span>
                        {saved && <Check className="h-3.5 w-3.5 text-[#ffffff]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        <span className="text-[12px] font-input text-[#9c9c9c]">
          {entry.ayahRef}
        </span>
      </div>
    </motion.div>
  );
};
