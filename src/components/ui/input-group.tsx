import * as React from "react";
import { cn } from "@/lib/utils";

export const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex flex-col rounded-2xl bg-white shadow-xs focus-within:ring-1 focus-within:ring-[#0A0A0A]",
      className
    )}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

export const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "block-start" | "block-end" }
>(({ className, align = "block-end", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-1.5 px-3 pb-2.5",
      align === "block-end" ? "justify-between" : "justify-start",
      className
    )}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

export const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
    size?: "icon-sm" | "icon-xs" | "default";
  }
>(({ className, variant = "ghost", size = "icon-sm", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex items-center justify-center rounded-xl text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F0F0F0] active:scale-95 transition-all outline-none border-0",
      variant === "default" && "bg-[#0A0A0A] text-white hover:bg-[#262626] hover:text-white",
      size === "icon-sm" && "h-8 w-8",
      size === "icon-xs" && "h-7 w-7",
      className
    )}
    {...props}
  />
));
InputGroupButton.displayName = "InputGroupButton";
