import * as React from "react";
import { cn } from "@/lib/utils";

interface MarkerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "separator";
}

const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    if (variant === "separator") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-3 py-1 text-xs text-[#9c9c9c] font-aeonik",
            className
          )}
          {...props}
        >
          <div className="h-px flex-1 bg-[#212121]" />
          {children}
          <div className="h-px flex-1 bg-[#212121]" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 text-xs md:text-sm text-[#9c9c9c] font-aeonik transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Marker.displayName = "Marker";

const MarkerIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#212121] text-[#f3f3f3]",
      className
    )}
    {...props}
  />
));
MarkerIcon.displayName = "MarkerIcon";

const MarkerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 text-start leading-relaxed font-normal text-[#c1c1c1]", className)}
    {...props}
  />
));
MarkerContent.displayName = "MarkerContent";

export { Marker, MarkerIcon, MarkerContent };
