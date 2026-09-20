import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex size-32 shrink-0 select-none items-center justify-center rounded-full bg-warm-mist text-ink text-body font-medium overflow-hidden",
          className
        )}
        {...props}
      >
        {children || (name ? name.trim().charAt(0) : "ع")}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = "", onError, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    if (hasError) return null;

    return (
      <img
        ref={ref}
        alt={alt}
        onError={(e) => {
          setHasError(true);
          onError?.(e);
        }}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-warm-mist text-ink text-body font-medium",
          className
        )}
        {...props}
      />
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";
