import React, {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

interface SmoothInputProps extends Omit<ComponentPropsWithoutRef<"textarea">, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  wrapperClassName?: string;
}

export const SmoothInput = ({
  className,
  wrapperClassName,
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder = "اسأل عن آية أو موضوع في التفسير…",
  ...props
}: SmoothInputProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const caretX = useMotionValue(0);
  const caretY = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion
      ? { stiffness: 10000, damping: 100, mass: 0.1 }
      : { stiffness: 450, damping: 28, mass: 0.4 }
  );

  const springCaretY = useSpring(
    caretY,
    prefersReducedMotion
      ? { stiffness: 10000, damping: 100, mass: 0.1 }
      : { stiffness: 450, damping: 28, mass: 0.4 }
  );

  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [inputValue]);

  // Sync measurement span styling with textarea
  const syncMeasureSpan = () => {
    const textarea = textareaRef.current;
    const span = measureRef.current;
    if (!textarea || !span) return;

    const styles = window.getComputedStyle(textarea);
    span.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    span.style.letterSpacing = styles.letterSpacing;
    span.style.direction = styles.direction;
    span.style.textAlign = styles.textAlign;
  };

  const updateCaretPosition = () => {
    const textarea = textareaRef.current;
    const span = measureRef.current;
    const container = containerRef.current;
    if (!textarea || !span || !container) return;

    const cursorIndex = textarea.selectionStart ?? 0;
    const textBefore = textarea.value.slice(0, cursorIndex);

    // Break by line
    const lines = textBefore.split("\n");
    const currentLineText = lines[lines.length - 1];
    const currentLineIndex = lines.length - 1;

    syncMeasureSpan();
    span.textContent = currentLineText || " ";

    const styles = window.getComputedStyle(textarea);
    const isRtl = styles.direction === "rtl";
    const paddingRight = parseFloat(styles.paddingRight) || 12;
    const paddingLeft = parseFloat(styles.paddingLeft) || 12;
    const paddingTop = parseFloat(styles.paddingTop) || 8;
    const lineHeight = parseFloat(styles.lineHeight) || 24;

    const lineWidth = span.offsetWidth;

    if (isRtl) {
      // In RTL, text starts from right and extends leftwards
      const containerWidth = container.clientWidth;
      const posX = containerWidth - paddingRight - lineWidth;
      caretX.set(Math.max(paddingLeft, posX));
    } else {
      const posX = paddingLeft + lineWidth;
      caretX.set(posX);
    }

    caretY.set(paddingTop + currentLineIndex * lineHeight);

    if (document.activeElement === textarea) {
      caretOpacity.set(1);
    }
  };

  useEffect(() => {
    updateCaretPosition();
  }, [inputValue]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleFocus = () => {
      updateCaretPosition();
      caretOpacity.set(1);
    };

    const handleBlur = () => {
      caretOpacity.set(0);
    };

    const handleSelectionChange = () => {
      if (document.activeElement === textarea) {
        requestAnimationFrame(updateCaretPosition);
      }
    };

    textarea.addEventListener("focus", handleFocus);
    textarea.addEventListener("blur", handleBlur);
    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("resize", updateCaretPosition);

    return () => {
      textarea.removeEventListener("focus", handleFocus);
      textarea.removeEventListener("blur", handleBlur);
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("resize", updateCaretPosition);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full cursor-text", wrapperClassName)}
      onClick={() => textareaRef.current?.focus()}
    >
      <textarea
        {...props}
        ref={textareaRef}
        rows={1}
        value={inputValue}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          if (!isControlled) setInternalValue(e.target.value);
          onChange?.(e.target.value);
          requestAnimationFrame(updateCaretPosition);
        }}
        className={cn(
          "w-full resize-none bg-transparent px-3 py-1.5 text-[15px] md:text-[16px] leading-[26px] text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[180px]",
          className
        )}
        style={{ caretColor: "transparent" }}
      />

      {/* Hidden element to measure text width for caret physics */}
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
      />

      {/* Spring-animated smooth caret */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-[2px] h-[20px] bg-foreground rounded-full"
        style={{
          x: springCaretX,
          y: springCaretY,
          opacity: caretOpacity,
        }}
        animate={{
          opacity: [1, 0.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.1,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
