import * as React from "react";
import { cn } from "@/src/lib/utils";

interface CollapsibleContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null);

export const Collapsible: React.FC<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ open: controlledOpen, defaultOpen = true, onOpenChange, children, className }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
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

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div className={cn("w-full", className)}>{children}</div>
    </CollapsibleContext.Provider>
  );
};

export const CollapsibleTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}> = ({ children, className }) => {
  const ctx = React.useContext(CollapsibleContext);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ctx?.setOpen((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx?.setOpen((prev) => !prev);
        }
      }}
      className={cn("cursor-pointer select-none", className)}
    >
      {children}
    </div>
  );
};

export const CollapsibleContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx?.open) return null;
  return <div className={cn("overflow-hidden transition-all duration-150", className)}>{children}</div>;
};

export const useCollapsible = () => {
  return React.useContext(CollapsibleContext);
};
