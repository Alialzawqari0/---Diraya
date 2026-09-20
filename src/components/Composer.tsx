import React, { useState } from "react";
import { ArrowUpIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmoothInput } from "./ui/smooth-input";
import { cn } from "../lib/utils";

interface ComposerProps {
  chatId: string;
  isInitial?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({ chatId, isInitial = false }) => {
  const { sendMessage, books, selectedBookIds, setSelectedBookIds } = useApp();
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Items following user's exact specification with null for all
  const items = [
    { label: "جميع كتب التفسير", value: null },
    ...books.map((b) => ({ label: b.name, value: b.id })),
  ];

  const currentSelectValue =
    selectedBookIds.length === books.length || selectedBookIds.length === 0
      ? null
      : selectedBookIds.length === 1
      ? selectedBookIds[0]
      : null;

  const handleTafsirSelect = (val: string | null) => {
    if (!val) {
      setSelectedBookIds(books.map((b) => b.id));
    } else {
      setSelectedBookIds([val]);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting) return;

    const text = inputText;
    setInputText("");
    setIsSubmitting(true);
    try {
      await sendMessage(chatId, text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full transition-all", isInitial ? "max-w-[680px]" : "max-w-[768px]")}>
      {/* Main Composer Box - Hyperstudio Obsidian card with Graphite 1px border and Card Slate elevation */}
      <div className="relative rounded-[20px] bg-[#101010] border border-[#212121] hover:border-[#3b3d45] focus-within:border-[#474747] p-3.5 md:p-4 shadow-sm transition-colors">
        {/* Smooth Caret Animated Input */}
        <SmoothInput
          value={inputText}
          onChange={(val) => setInputText(val)}
          onSubmit={handleSubmit}
          placeholder="اسأل عن آية أو موضوع في التفسير…"
          className="min-h-[44px] text-[#f3f3f3] placeholder:text-[#9c9c9c]"
        />

        {/* Bottom controls inside composer */}
        <div className="flex items-center justify-between pt-3 ps-1 pe-1">
          {/* Send Button: Signal White filled circle with Carbon icon */}
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={handleSubmit}
            disabled={!inputText.trim() || isSubmitting}
            aria-label="إرسال"
            className="h-9 w-9 rounded-full bg-[#ffffff] text-[#080808] hover:bg-[#f3f3f3] disabled:opacity-20 shadow-none border-0 transition-transform active:scale-95"
          >
            <ArrowUpIcon className="h-4 w-4 stroke-[2.5]" />
          </Button>

          {/* Right side controls: Tafsir Book Select with Graphite border */}
          <div className="flex items-center gap-2">
            <Select
              items={items}
              value={currentSelectValue}
              onValueChange={handleTafsirSelect}
            >
              <SelectTrigger className="w-full max-w-48 bg-[#080808] border border-[#212121] text-[#f3f3f3] rounded-[99px] text-[13px] hover:border-[#474747]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#080808] text-[#f3f3f3] border border-[#212121] rounded-[8px]">
                <SelectGroup>
                  <SelectLabel className="text-[#9c9c9c] text-[12px]">كتب التفسير</SelectLabel>
                  {items.map((item) => (
                    <SelectItem key={item.value ?? "all"} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Note under the composer in Smoke text */}
      <div className="mt-3 text-center text-[13px] text-[#9c9c9c] font-aeonik font-normal select-none">
        دِرَايَة أداة بحث في كتب التفسير، وليست مصدر فتوى.
      </div>
    </div>
  );
};
