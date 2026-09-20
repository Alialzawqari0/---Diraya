import React, { useMemo } from "react";
import { motion } from "motion/react";

interface LineByLineRevealProps {
  text: string;
  className?: string;
  lineClassName?: string;
  staggerDelay?: number;
}

export const LineByLineReveal: React.FC<LineByLineRevealProps> = ({
  text,
  className = "",
  lineClassName = "",
  staggerDelay = 0.28,
}) => {
  // Break text into natural lines/segments for line-by-line reveal
  const lines = useMemo(() => {
    if (!text) return [];

    // If text already contains explicit line breaks
    if (text.includes("\n")) {
      return text.split("\n").filter((l) => l.trim().length > 0);
    }

    // Split smartly by sentence terminators (. or ؛ or ! or ؟)
    const rawSentences = text.split(/(?<=[.؛!؟])\s+/);
    const parsedLines: string[] = [];

    rawSentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (!trimmed) return;

      // If a sentence is long (> 14 words), divide at commas or word boundaries
      const words = trimmed.split(" ");
      if (words.length <= 14) {
        parsedLines.push(trimmed);
      } else {
        // Chunk by commas if possible
        const clauses = trimmed.split(/(?<=[،])\s+/);
        if (clauses.length > 1) {
          clauses.forEach((cl) => {
            if (cl.trim()) parsedLines.push(cl.trim());
          });
        } else {
          // Chunk into ~11-13 words per line
          for (let i = 0; i < words.length; i += 12) {
            const chunk = words.slice(i, i + 12).join(" ");
            if (chunk) parsedLines.push(chunk);
          }
        }
      }
    });

    return parsedLines.length > 0 ? parsedLines : [text];
  }, [text]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={`space-y-2.5 ${className}`}
    >
      {lines.map((line, index) => (
        <motion.p
          key={`${index}-${line.slice(0, 15)}`}
          variants={{
            hidden: {
              opacity: 0,
              y: 8,
              filter: "blur(4px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.48,
                ease: [0.25, 1, 0.5, 1],
              },
            },
          }}
          className={`text-start leading-[2.1] select-text ${lineClassName}`}
        >
          {line}
        </motion.p>
      ))}
    </motion.div>
  );
};
