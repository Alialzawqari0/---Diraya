import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] placeholder:text-[#6B6B6B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
