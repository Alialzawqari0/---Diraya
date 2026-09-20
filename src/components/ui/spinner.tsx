import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "default" | "lg";
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5 border-[2px]",
    default: "h-4 w-4 border-[2px]",
    lg: "h-5 w-5 border-[2.5px]",
  };

  return (
    <span
      role="status"
      aria-label="تحميل..."
      className={cn(
        "inline-block rounded-full border-[#0A0A0A] border-t-transparent animate-spin",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
