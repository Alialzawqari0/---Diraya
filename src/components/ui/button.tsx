import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "pill" | "saved";
  size?: "default" | "sm" | "icon" | "icon-sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          /* Primary (default) */
          variant === "default" &&
            "h-36 px-16 rounded-md bg-deep-teal text-soft-paper text-body hover:opacity-95",
          /* Secondary / Outline / Ghost */
          (variant === "outline" || variant === "secondary") &&
            "h-36 px-16 rounded-md border border-warm-mist bg-transparent text-ink text-body hover:bg-warm-mist/35",
          /* Ghost */
          variant === "ghost" &&
            "h-36 px-16 rounded-md bg-transparent text-graphite text-body hover:text-ink hover:bg-warm-mist/35",
          /* Saved */
          variant === "saved" &&
            "h-32 px-12 rounded-md bg-deep-teal/8 text-deep-teal border border-deep-teal/20 text-body-sm",
          /* Link */
          variant === "link" &&
            "text-deep-teal underline-offset-4 hover:underline",
          /* Dense / Small Size */
          size === "sm" && "h-32 px-12 text-body-sm",
          size === "icon" && "size-32 rounded-md p-0",
          size === "icon-sm" && "size-24 rounded-md p-0",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
