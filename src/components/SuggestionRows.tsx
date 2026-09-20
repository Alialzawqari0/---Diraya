import React from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUGGESTIONS } from "../messages";

interface SuggestionRowsProps {
  chatId: string;
  items?: readonly string[] | string[];
  className?: string;
}

export const SuggestionRows: React.FC<SuggestionRowsProps> = ({
  chatId,
  items = SUGGESTIONS,
  className = "",
}) => {
  const { sendMessage } = useApp();

  return (
    <div className={`flex flex-col gap-1.5 w-full pt-1 ${className}`} dir="rtl">
      {items.map((suggestion, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => sendMessage(chatId, suggestion)}
          className="group flex items-center justify-between w-full px-3.5 py-2.5 rounded-[8px] bg-[#101010] border border-[#212121] hover:border-[#3b3d45] hover:bg-[#151515] text-start transition-all active:scale-[0.99] focus:outline-none focus:border-[#474747]"
        >
          <span className="text-[13.5px] font-aeonik font-normal text-[#c1c1c1] group-hover:text-[#f3f3f3] transition-colors">
            {suggestion}
          </span>
          <ArrowLeftIcon className="h-3.5 w-3.5 text-[#6f6759] group-hover:text-[#f3f3f3] group-hover:-translate-x-0.5 transition-all shrink-0 ms-2" />
        </button>
      ))}
    </div>
  );
};
