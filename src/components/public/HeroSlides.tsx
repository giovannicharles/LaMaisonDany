import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { optimizeImage } from "@/lib/images";
import { cn } from "@/lib/utils";

interface HeroSlidesProps {
  images: string[];
  interval?: number;
  pauseLabel: string;
  playLabel: string;
}

export default function HeroSlides({ images, interval = 6, pauseLabel, playLabel }: HeroSlidesProps) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const moving = !reduce && !paused && images.length > 1;

  useEffect(() => {
    setI(0);
  }, [images.length]);

  useEffect(() => {
    if (!moving) return;
    const t = setInterval(() => setI((n) => (n + 1) % images.length), Math.max(3, interval) * 1000);
    return () => clearInterval(t);
  }, [moving, interval, images.length]);

  if (images.length === 0) return null;
  const seconds = Math.max(3, interval) + 1.6;

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-blush-deep">
        {images.map((src, n) => {
          const active = n === i;
          return (
            <img
              key={src}
              src={optimizeImage(src, 1800)}
              alt=""
              loading={n === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out", active ? "opacity-100" : "opacity-0")}
              style={{
                transform: "scale(1.05)",
                ...(active && moving ? { animation: `lmd-kenburns ${seconds}s ease-out forwards` } : {}),
              }}
            />
          );
        })}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-full bg-blush/90 px-3 py-2 shadow-md ring-1 ring-blush-edge md:left-10">
          <ul className="flex items-center gap-1.5" aria-label="Images du bandeau">
            {images.map((_, n) => (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`Image ${n + 1} sur ${images.length}`}
                  aria-current={n === i ? "true" : undefined}
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <span className={cn("h-2 rounded-full transition-all duration-500", n === i ? "w-5 bg-wine" : "w-2 bg-wine/30")} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? playLabel : pauseLabel}
            aria-pressed={paused}
            className="flex h-9 w-9 items-center justify-center rounded-full text-wine transition-colors hover:bg-blush-deep"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      )}
    </>
  );
}
