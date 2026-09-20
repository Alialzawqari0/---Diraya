import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

interface SelectItemData {
  label: string;
  value: string | null;
}

interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  value: string | null;
  onValueChange?: (value: string | null) => void;
  items?: SelectItemData[];
  selectedLabel: string | null;
  registerItem: (value: string | null, label: string) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select compound components must be used within a Select");
  }
  return context;
}

export interface SelectProps {
  children?: React.ReactNode;
  items?: SelectItemData[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  items,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(defaultValue);
  const [itemLabels, setItemLabels] = React.useState<Map<string | null, string>>(new Map());

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const registerItem = React.useCallback((val: string | null, label: string) => {
    setItemLabels((prev) => {
      if (prev.get(val) === label) return prev;
      const next = new Map(prev);
      next.set(val, label);
      return next;
    });
  }, []);

  const handleValueChange = React.useCallback(
    (newValue: string | null) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [isControlled, onValueChange]
  );

  // Compute label from items prop or registered items
  const selectedLabel = React.useMemo(() => {
    if (items) {
      const match = items.find((i) => i.value === currentValue);
      if (match) return match.label;
    }
    return itemLabels.get(currentValue) || null;
  }, [items, currentValue, itemLabels]);

  // Click outside listener
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value: currentValue,
        onValueChange: handleValueChange,
        items,
        selectedLabel,
        registerItem,
      }}
    >
      <div ref={containerRef} className="relative inline-block text-start">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-32 w-full items-center justify-between gap-8 rounded-md bg-soft-paper border border-warm-mist px-12 py-4 text-body-sm font-medium text-graphite hover:bg-warm-mist/35 hover:text-ink transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 select-none",
          className
        )}
        aria-expanded={open}
        {...props}
      >
        <div className="flex items-center gap-8 truncate">{children}</div>
        <ChevronDown
          className={cn(
            "size-14 shrink-0 text-graphite transition-transform duration-150",
            open && "rotate-180 text-ink"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue: React.FC<{
  placeholder?: string;
  className?: string;
}> = ({ placeholder = "اختر...", className }) => {
  const { selectedLabel } = useSelect();

  return (
    <span className={cn("truncate text-start text-body-sm font-medium text-graphite", !selectedLabel && "text-ash", className)}>
      {selectedLabel || placeholder}
    </span>
  );
};

export interface SelectContentProps {
  children?: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
  align = "end",
}) => {
  const { open } = useSelect();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          dir="rtl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={cn(
            "absolute z-50 mt-4 min-w-56 max-h-72 overflow-y-auto rounded-xl bg-soft-paper border border-warm-mist p-4 text-ink shadow-subtle focus-visible:outline-none",
            align === "start" ? "start-0" : align === "end" ? "end-0" : "start-1/2 -translate-x-1/2",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SelectGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("flex flex-col gap-4 p-0", className)}>{children}</div>;
};

export const SelectLabel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "px-12 py-4 text-caption font-medium text-graphite select-none text-start",
        className
      )}
    >
      {children}
    </div>
  );
};

export interface SelectItemProps {
  value: string | null;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  className,
  disabled = false,
}) => {
  const { value: selectedValue, onValueChange, registerItem } = useSelect();
  const isSelected = selectedValue === value;

  React.useEffect(() => {
    if (typeof children === "string") {
      registerItem(value, children);
    }
  }, [value, children, registerItem]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative flex h-32 w-full cursor-pointer select-none items-center justify-between rounded-md px-12 text-start text-body font-normal text-ink outline-none transition-colors hover:bg-warm-mist/35",
        isSelected && "bg-warm-mist/45 font-medium text-ink",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      <span className="truncate">{children}</span>
      <div
        className={cn(
          "flex size-16 shrink-0 items-center justify-center transition-opacity",
          isSelected ? "opacity-100 text-deep-teal" : "opacity-0"
        )}
      >
        <Check className="size-14 stroke-[2]" />
      </div>
    </button>
  );
};

export const SelectSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("my-4 h-px bg-warm-mist", className)} />
);
