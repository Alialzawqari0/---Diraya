import * as React from "react";
import { cn } from "@/lib/utils";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, align = "start", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full gap-3 items-start",
          align === "end" ? "flex-row-reverse justify-start" : "flex-row justify-start",
          className
        )}
        {...props}
      />
    );
  }
);
Message.displayName = "Message";

export const MessageAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[#EBEBEB] text-[#0A0A0A] overflow-hidden",
        className
      )}
      {...props}
    />
  );
});
MessageAvatar.displayName = "MessageAvatar";

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 flex-col gap-1.5 min-w-0 max-w-full", className)}
      {...props}
    />
  );
});
MessageContent.displayName = "MessageContent";

export const MessageFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-1 text-[12px] text-[#737373] mt-1 select-none",
        className
      )}
      {...props}
    />
  );
});
MessageFooter.displayName = "MessageFooter";
