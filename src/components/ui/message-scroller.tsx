import * as React from "react";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface MessageScrollerContextType {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  setIsAtBottom: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollAnchorRef: (node: HTMLElement | null) => void;
}

const MessageScrollerContext = React.createContext<MessageScrollerContextType | null>(null);

export function useMessageScroller() {
  const context = React.useContext(MessageScrollerContext);
  if (!context) {
    throw new Error("useMessageScroller must be used within a MessageScrollerProvider");
  }
  return context;
}

export const MessageScrollerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const lastAnchorRef = React.useRef<HTMLElement | null>(null);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior,
      });
      setIsAtBottom(true);
    }
  }, []);

  const scrollAnchorRef = React.useCallback((node: HTMLElement | null) => {
    if (node) {
      lastAnchorRef.current = node;
    }
  }, []);

  return (
    <MessageScrollerContext.Provider
      value={{
        viewportRef,
        isAtBottom,
        setIsAtBottom,
        scrollToBottom,
        scrollAnchorRef,
      }}
    >
      {children}
    </MessageScrollerContext.Provider>
  );
};

export const MessageScroller = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative flex h-full flex-1 flex-col overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
});
MessageScroller.displayName = "MessageScroller";

export const MessageScrollerViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onScroll, ...props }, forwardedRef) => {
  const { viewportRef, isAtBottom, setIsAtBottom, scrollToBottom } = useMessageScroller();
  const internalRef = React.useRef<HTMLDivElement | null>(null);

  // Sync refs
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (viewportRef && "current" in viewportRef) {
        (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, viewportRef]
  );

  // Check scroll threshold
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom <= 40;
      setIsAtBottom(atBottom);
      onScroll?.(e);
    },
    [onScroll, setIsAtBottom]
  );

  // Auto-scroll when new content enters IF the user is currently at the bottom
  React.useEffect(() => {
    const el = internalRef.current;
    if (!el) return;

    let previousHeight = el.scrollHeight;

    const observer = new MutationObserver(() => {
      if (isAtBottom) {
        // If content height expanded, pin to bottom
        if (el.scrollHeight !== previousHeight) {
          scrollToBottom("instant");
          previousHeight = el.scrollHeight;
        }
      }
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [isAtBottom, scrollToBottom]);

  return (
    <div
      ref={setRefs}
      role="region"
      tabIndex={0}
      onScroll={handleScroll}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden scroll-smooth focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
MessageScrollerViewport.displayName = "MessageScrollerViewport";

export const MessageScrollerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { "aria-busy"?: boolean }
>(({ className, children, "aria-busy": ariaBusy, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="log"
      aria-relevant="additions"
      aria-busy={ariaBusy}
      className={cn("flex flex-col min-h-full", className)}
      {...props}
    >
      {children}
    </div>
  );
});
MessageScrollerContent.displayName = "MessageScrollerContent";

export interface MessageScrollerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  messageId?: string;
  scrollAnchor?: boolean;
  children: React.ReactNode;
}

export const MessageScrollerItem = React.forwardRef<
  HTMLDivElement,
  MessageScrollerItemProps
>(({ messageId, scrollAnchor = false, className, children, ...props }, forwardedRef) => {
  const { scrollAnchorRef } = useMessageScroller();
  const internalRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollAnchor && internalRef.current) {
      scrollAnchorRef(internalRef.current);
    }
  }, [scrollAnchor, scrollAnchorRef]);

  return (
    <motion.div
      ref={(node) => {
        internalRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      data-message-id={messageId}
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full py-1.5", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});
MessageScrollerItem.displayName = "MessageScrollerItem";

export interface MessageScrollerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "default" | "outline";
}

export const MessageScrollerButton = React.forwardRef<
  HTMLButtonElement,
  MessageScrollerButtonProps
>(({ className, label = "الانتقال إلى الأحدث", variant = "default", onClick, ...props }, ref) => {
  const { isAtBottom, scrollToBottom } = useMessageScroller();

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.92 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
        >
          <button
            ref={ref}
            type="button"
            onClick={(e) => {
              scrollToBottom("smooth");
              onClick?.(e);
            }}
            aria-label={label}
            title={label}
            className={cn(
              "group flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2 text-[13px] font-medium text-[#0A0A0A] shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:bg-white active:scale-95 transition-all duration-200 outline-none select-none",
              variant === "outline" ? "border border-[#E5E5E5]" : "border-0",
              className
            )}
            {...props}
          >
            <span className="text-[12.5px] font-medium">{label}</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0F0F0] group-hover:bg-[#E5E5E5] transition-colors">
              <ArrowDown className="h-3 w-3 text-[#0A0A0A] stroke-[2.5]" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
MessageScrollerButton.displayName = "MessageScrollerButton";
