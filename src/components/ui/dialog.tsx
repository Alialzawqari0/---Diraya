import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

export const Dialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ open = false, onOpenChange = () => {}, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  const ctx = React.useContext(DialogContext);
  return (
    <div
      className={cn("inline-block cursor-pointer", className)}
      onClick={(e) => {
        onClick?.();
        ctx?.onOpenChange(true);
      }}
    >
      {children}
    </div>
  );
};

export const DialogContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-16">
      {/* Backdrop: warm-mist 40% overlay */}
      <div
        className="fixed inset-0 bg-warm-mist/40 transition-opacity"
        onClick={() => ctx.onOpenChange(false)}
      />
      {/* Dialog box: soft-paper, 1px warm-mist, rounded-xl, shadow-subtle */}
      <div
        role="dialog"
        aria-modal="true"
        dir="rtl"
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl border border-warm-mist bg-soft-paper p-16 shadow-subtle focus-visible:outline-none flex flex-col gap-12",
          className
        )}
      >
        <button
          onClick={() => ctx.onOpenChange(false)}
          className="absolute top-16 start-16 size-24 rounded-md flex items-center justify-center text-graphite hover:bg-warm-mist/35 transition-colors focus-visible:outline-none"
          aria-label="إغلاق"
        >
          <X className="size-16" />
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("flex flex-col gap-4 text-start pb-4", className)}>
    {children}
  </div>
);

export const DialogTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <h2 className={cn("text-body-lg font-semibold text-ink", className)}>
    {children}
  </h2>
);

export const DialogDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <p className={cn("text-body font-normal text-graphite leading-relaxed", className)}>
    {children}
  </p>
);

export const DialogFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("flex flex-row-reverse items-center justify-start gap-8 pt-12 border-t border-warm-mist", className)}>
    {children}
  </div>
);
