import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

interface SplitLinesProps {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
  onView?: boolean;
}

export default function SplitLines({ lines, className, delay = 0, stagger = 0.12, onView = false }: SplitLinesProps) {
  const trigger = onView
    ? { whileInView: "show" as const, viewport: { once: true, amount: 0.6 } }
    : { animate: "show" as const };

  return (
    <motion.span
      className={`block ${className ?? ""}`}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "108%", rotate: 3 },
              show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
