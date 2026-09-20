import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

export const DropdownMenu: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
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
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-start">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}> = ({ children, className }) => {
  const ctx = React.useContext(DropdownMenuContext);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        ctx?.setOpen((prev) => !prev);
      }}
      className={cn("cursor-pointer inline-flex items-center", className)}
    >
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<{
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom";
  className?: string;
}> = ({ children, align = "end", side = "bottom", className }) => {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx?.open) return null;

  return (
    <div
      dir="rtl"
      className={cn(
        "absolute z-50 min-w-48 overflow-hidden rounded-xl bg-soft-paper border border-warm-mist p-4 text-ink shadow-subtle",
        side === "top" ? "bottom-full mb-4" : "top-full mt-4",
        align === "start" ? "start-0" : align === "end" ? "end-0" : "start-1/2 -translate-x-1/2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  destructive?: boolean;
}> = ({ children, onClick, className, disabled }) => {
  const ctx = React.useContext(DropdownMenuContext);
  return (
    <div
      role="menuitem"
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onClick?.(e);
        ctx?.setOpen(false);
      }}
      className={cn(
        "relative flex h-32 cursor-pointer select-none items-center rounded-md px-12 text-body font-normal text-ink outline-none transition-colors hover:bg-warm-mist/35",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("my-4 h-px bg-warm-mist", className)} />
);

export const DropdownMenuLabel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("px-12 py-4 text-caption font-medium text-graphite", className)}>
    {children}
  </div>
);

export const DropdownMenuSub: React.FC<{
  label: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, children, icon, className }) => {
  const [isSubOpen, setIsSubOpen] = React.useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsSubOpen(true)}
      onMouseLeave={() => setIsSubOpen(false)}
    >
      <div
        className={cn(
          "flex h-32 cursor-pointer select-none items-center justify-between rounded-md px-12 text-body font-normal text-ink hover:bg-warm-mist/35 transition-colors",
          className
        )}
      >
        <span className="flex items-center gap-8">
          {icon}
          {label}
        </span>
        <span className="text-caption text-graphite ps-8">‹</span>
      </div>
      {isSubOpen && (
        <div
          dir="rtl"
          className="absolute end-full top-0 me-4 min-w-44 rounded-xl border border-warm-mist bg-soft-paper p-4 shadow-subtle text-ink"
        >
          {children}
        </div>
      )}
    </div>
  );
};
