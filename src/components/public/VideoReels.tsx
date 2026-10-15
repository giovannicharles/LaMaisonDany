import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Play, X } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";
import { whatsappLink } from "@/api/client";
import type { SiteVideo } from "@/data/videos";
import WhatsAppIcon from "./WhatsAppIcon";
import Rich from "./Rich";

function Reel({ video, onOpen }: { video: SiteVideo; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <button
      onClick={onOpen}
      aria-label={`Lire la vidéo : ${video.title}`}
      className="group relative block aspect-[9/16] w-[72vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-[1.75rem] bg-wine-deep text-left ring-1 ring-blush/15 md:w-auto md:max-w-none"
    >
      <video
        ref={ref}
        src={video.src}
        poster={video.poster || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-wine-deep/85 via-transparent to-wine-deep/20" />
      <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-blush/90 text-wine transition-transform group-hover:scale-110">
        <Play className="h-4 w-4 translate-x-px fill-current" />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4 font-brand text-xl leading-tight text-blush md:p-5">{video.title}</span>
    </button>
  );
}

export default function VideoReels() {
  const site = useSite();
  const [open, setOpen] = useState<SiteVideo | null>(null);
  const videos = site.videos.filter((v) => v.src);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (videos.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-wine to-wine-deep text-blush">
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-brand text-4xl leading-[1.03] md:text-6xl">
            <Rich text={site.texts.videos_title} accent="italic text-blush-edge" />
          </h2>
          <p className="max-w-[40ch] text-blush/75">{site.texts.videos_text}</p>
        </div>

        <div className="-mx-5 mt-10 flex snap-x gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
          {videos.map((v) => (
            <Reel key={v.src} video={v} onOpen={() => setOpen(v)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-wine-deep/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <button onClick={() => setOpen(null)} aria-label="Fermer" className="absolute right-4 top-4 rounded-full bg-blush/15 p-3 text-blush hover:bg-blush/25">
              <X className="h-6 w-6" />
            </button>
            <motion.div
              className="flex max-h-[92svh] w-full max-w-[420px] flex-col gap-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <video src={open.src} poster={open.poster || undefined} controls autoPlay playsInline className="max-h-[72svh] w-full rounded-3xl bg-black object-contain" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-brand text-2xl">{open.title}</p>
                <div className="flex gap-2">
                  {open.product_slug && (
                    <Link to={`/produit/${open.product_slug}`} onClick={() => setOpen(null)} className="lmd-btn bg-blush !py-2.5 !text-sm text-wine">
                      Voir le produit
                    </Link>
                  )}
                  <a
                    href={whatsappLink(`Bonjour LaMaison Dany, j'ai vu votre vidéo « ${open.title} ». Pouvez-vous m'en dire plus ?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lmd-btn !py-2.5 !text-sm border border-blush/40 text-blush hover:bg-blush hover:text-wine"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
