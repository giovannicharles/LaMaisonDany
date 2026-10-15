import { type ReactNode } from "react";
import { CreamJar, LipstickArt, PerfumeBottle } from "@/components/art/Bottles";
import { optimizeImage } from "@/lib/images";
import { pickPhotos, useShowcase } from "@/lib/showcase";

interface PageHeaderProps {
  title: ReactNode;
  intro?: string;
}

export default function PageHeader({ title, intro }: PageHeaderProps) {
  const photos = pickPhotos(useShowcase(), 3);
  const real = photos.length >= 3;

  return (
    <section className="relative overflow-hidden bg-blush-deep/60 pt-[108px]">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-blush-edge/50 blur-3xl"
      />
      <div className="relative max-w-[1320px] mx-auto px-5 md:px-10 py-14 md:py-20 grid md:grid-cols-[1.2fr_0.8fr] items-center gap-8">
        <div className="lmd-rise">
          <h1 className="font-brand text-[2.8rem] sm:text-6xl md:text-7xl leading-[1] text-wine max-w-[14ch]">{title}</h1>
          {intro && <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft">{intro}</p>}
        </div>

        <div aria-hidden className="hidden md:block relative h-[260px] lmd-rise" style={{ animationDelay: "0.12s" }}>
          {real ? (
            <>
              <div className="absolute bottom-0 right-[28%] h-[250px] w-[170px] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] bg-blush-edge shadow-[0_24px_40px_-26px_rgba(107,23,48,0.6)]">
                <img src={optimizeImage(photos[0], 400)} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute right-[1%] top-0 h-[120px] w-[130px] overflow-hidden rounded-[1.5rem] bg-blush-edge shadow-[0_20px_34px_-24px_rgba(107,23,48,0.6)] ring-4 ring-blush">
                <img src={optimizeImage(photos[1], 300)} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-[1%] h-[120px] w-[130px] overflow-hidden rounded-[1.5rem] bg-blush-edge shadow-[0_20px_34px_-24px_rgba(107,23,48,0.6)] ring-4 ring-blush">
                <img src={optimizeImage(photos[2], 300)} alt="" className="h-full w-full object-cover" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute bottom-0 right-[26%] flex h-[250px] w-[170px] items-end justify-center rounded-t-[999px] rounded-b-[1.5rem] bg-blush-edge pb-4">
                <PerfumeBottle className="h-[84%]" label="D" />
              </div>
              <div className="absolute bottom-0 right-[2%] flex h-[130px] w-[110px] items-end justify-center rounded-[1.5rem] bg-rose pb-3">
                <LipstickArt className="h-[86%]" />
              </div>
              <div className="absolute right-[2%] top-2 flex h-[96px] w-[140px] items-center justify-center rounded-[1.5rem] bg-blush">
                <CreamJar className="w-[74%]" />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
