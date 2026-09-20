import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

export const Popover: React.FC<{
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === "function" ? value(open) : value;
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, open, onOpenChange]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-start">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ctx = React.useContext(PopoverContext);
  return (
    <div
      onClick={() => ctx?.setOpen((prev) => !prev)}
      className={cn("cursor-pointer inline-flex items-center", className)}
    >
      {children}
    </div>
  );
};

export const PopoverContent: React.FC<{
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom";
  className?: string;
}> = ({ children, align = "start", side = "bottom", className }) => {
  const ctx = React.useContext(PopoverContext);
  if (!ctx?.open) return null;

  return (
    <div
      dir="rtl"
      className={cn(
        "absolute z-50 min-w-64 rounded-xl bg-soft-paper border border-warm-mist p-12 text-ink shadow-subtle",
        side === "top" ? "bottom-full mb-4" : "top-full mt-4",
        align === "start" ? "start-0" : align === "end" ? "end-0" : "start-1/2 -translate-x-1/2",
        className
      )}
    >
      {children}
    </div>
  );
};
