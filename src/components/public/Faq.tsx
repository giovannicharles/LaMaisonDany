import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";

export default function Faq() {
  const { faq } = useSite();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-blush-edge/80 rounded-[1.75rem] bg-white/70 px-6 md:px-8">
      {faq.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-brand text-xl text-wine"
              >
                {item.q}
                <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="shrink-0 rounded-full bg-blush-deep p-1.5">
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 max-w-[62ch] leading-relaxed text-ink-soft">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
