import * as React from "react";
import { cn } from "@/lib/utils";

export const Empty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center text-center p-8 select-none",
      className
    )}
    {...props}
  />
));
Empty.displayName = "Empty";

export const EmptyHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center space-y-2", className)}
    {...props}
  />
));
EmptyHeader.displayName = "EmptyHeader";

export const EmptyMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "icon" | "default" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mb-3 flex items-center justify-center text-[#737373]",
      variant === "icon" && "h-12 w-12 rounded-2xl bg-[#F5F5F5] text-[#0A0A0A]",
      className
    )}
    {...props}
  />
));
EmptyMedia.displayName = "EmptyMedia";

export const EmptyTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-[18px] font-semibold text-[#0A0A0A]", className)}
    {...props}
  />
));
EmptyTitle.displayName = "EmptyTitle";

export const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[14px] text-[#737373] max-w-sm leading-relaxed", className)}
    {...props}
  />
));
EmptyDescription.displayName = "EmptyDescription";
