import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";
import { Waves } from "@/components/art/Ornaments";

const FIRST = "LaMaison".split("");
const SECOND = "Dany".split("");

type Phase = "in" | "fill" | "out";

function Word({ filled }: { filled?: boolean }) {
  const tone = filled ? "text-wine" : "text-wine/20";
  return (
    <span className="flex items-baseline justify-center gap-[0.35em] whitespace-nowrap font-brand leading-none">
      <span className={tone}>{FIRST.join("")}</span>
      <span className={`italic ${filled ? "text-rose" : "text-rose/25"}`}>{SECOND.join("")}</span>
    </span>
  );
}

export default function Preloader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const { texts } = useSite();
  const [phase, setPhase] = useState<Phase>("in");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setPhase("fill"), 1250);
    const t2 = setTimeout(() => setPhase("out"), 2650);
    const t3 = setTimeout(onDone, 3700);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [reduce, onDone]);

  useEffect(() => {
    if (phase !== "fill") return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1300);
      setCount(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const leaving = phase === "out";
  const letters = [...FIRST.map((c) => ({ c, italic: false })), ...SECOND.map((c) => ({ c, italic: true }))];

  return (
    <main className="fixed inset-0 z-[100]" role="status" aria-label="Chargement de LaMaison Dany" onClick={onDone}>
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-blush"
        animate={{ y: leaving ? "-100%" : "0%" }}
        transition={{ duration: 1, ease: EASE }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-blush"
        animate={{ y: leaving ? "100%" : "0%" }}
        transition={{ duration: 1, ease: EASE }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div
          className="lmd-grid absolute inset-[-48px]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(107,23,48,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(107,23,48,0.14) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {[18, 42, 66, 82].map((y, i) => (
            <motion.line
              key={"h" + y}
              x1="0" x2="100" y1={y} y2={y}
              stroke="#b23a5b" strokeOpacity="0.35" strokeWidth="0.15" vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, delay: 0.2 + i * 0.18, ease: EASE }}
            />
          ))}
          {[22, 50, 78].map((x, i) => (
            <motion.line
              key={"v" + x}
              y1="0" y2="100" x1={x} x2={x}
              stroke="#b23a5b" strokeOpacity="0.3" strokeWidth="0.15" vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, delay: 0.4 + i * 0.2, ease: EASE }}
            />
          ))}
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden">
          <div className="lmd-wave flex h-full w-[200%]">
            <Waves className="relative z-0 h-full w-1/2 text-rose/35" />
            <Waves className="relative z-0 h-full w-1/2 text-rose/35" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 1.08 : 1 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <div className="relative text-[2.4rem] min-[420px]:text-[3rem] sm:text-7xl md:text-8xl">
          <div aria-hidden className="invisible">
            <Word />
          </div>

          <div className="absolute inset-0 flex items-baseline justify-center gap-[0.35em] whitespace-nowrap font-brand leading-none">
            <span className="flex">
              {letters.slice(0, FIRST.length).map((l, i) => (
                <motion.span
                  key={i}
                  className="inline-block text-wine/20"
                  initial={{ y: "120%", rotate: 14, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, rotate: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: EASE }}
                >
                  {l.c}
                </motion.span>
              ))}
            </span>
            <span className="flex italic">
              {letters.slice(FIRST.length).map((l, i) => (
                <motion.span
                  key={i}
                  className="inline-block text-rose/25"
                  initial={{ y: "-120%", rotate: -14, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, rotate: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.45 + i * 0.09, ease: EASE }}
                >
                  {l.c}
                </motion.span>
              ))}
            </span>
          </div>

          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: phase === "in" ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)" }}
            transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
          >
            <Word filled />
          </motion.div>
        </div>

        <motion.div
          className="mt-10 flex w-full max-w-[280px] items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "in" ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="h-px flex-1 bg-wine/15 relative overflow-hidden">
            <span className="absolute inset-y-0 left-0 bg-rose" style={{ width: `${count}%` }} />
          </span>
          <span className="w-10 text-right font-text text-sm tabular-nums text-wine">{count}%</span>
        </motion.div>
        <p className="mt-5 text-sm text-ink-soft">{texts.loader_tagline}</p>
      </motion.div>
    </main>
  );
}
