import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { useMessageScroller } from "./ui/message-scroller";
import { cn } from "@/lib/utils";

export interface MessageAnimatedProps extends Omit<HTMLMotionProps<"div">, "children"> {
  scrollAnchor?: boolean;
  children: React.ReactNode;
}

export const MessageAnimated: React.FC<MessageAnimatedProps> = ({
  scrollAnchor = false,
  className,
  children,
  ...props
}) => {
  const { scrollAnchorRef } = useMessageScroller();
  const elementRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollAnchor && elementRef.current) {
      scrollAnchorRef(elementRef.current);
    }
  }, [scrollAnchor, scrollAnchorRef]);

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full py-1.5", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
