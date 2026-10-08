import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const offsets = {
  up: { y: 36 },
  down: { y: -36 },
  left: { x: 36 },
  right: { x: -36 },
  none: {},
};


export function ScrollReveal({ children, className, delay = 0, direction = "up" }: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(6px)", ...offsets[direction] }}
      whileInView={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
