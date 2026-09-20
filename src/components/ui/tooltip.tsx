import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-flex"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<{
  children?: React.ReactNode;
  asChild?: boolean;
  render?: React.ReactNode;
}> = ({ children, render }) => {
  return <>{render || children}</>;
};

export const TooltipContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const context = React.useContext(TooltipContext);
  if (!context?.open) return null;

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute -top-8 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg bg-[#0A0A0A] px-2.5 py-1 text-[11px] font-medium text-white shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
