import * as React from "react";
import { cn } from "@/lib/utils";

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "ghost";
  align?: "start" | "end";
}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant = "default", align = "start", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative text-[15px] md:text-[16px] leading-relaxed select-text transition-colors",
          variant === "default" &&
            "rounded-[22px] bg-white text-[#0A0A0A] shadow-[0_2px_14px_rgba(0,0,0,0.03)] border-0",
          variant === "muted" &&
            "rounded-[20px] bg-[#EFEFEF] text-[#0A0A0A] border-0 shadow-none",
          variant === "ghost" && "bg-transparent text-[#0A0A0A] border-0 p-0 shadow-none",
          align === "end" ? "text-start" : "text-start",
          className
        )}
        {...props}
      />
    );
  }
);
Bubble.displayName = "Bubble";

export const BubbleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("px-4.5 py-3", className)} {...props} />;
});
BubbleContent.displayName = "BubbleContent";
