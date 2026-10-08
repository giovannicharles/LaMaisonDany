import { type ReactNode } from "react";
import { CreamJar, LipstickArt, PerfumeBottle } from "@/components/art/Bottles";

interface PageHeaderProps {
  title: ReactNode;
  intro?: string;
}

export default function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-blush-deep/60 pt-[72px]">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-blush-edge/50 blur-3xl"
      />
      <div className="relative max-w-[1320px] mx-auto px-5 md:px-10 py-14 md:py-20 grid md:grid-cols-[1.2fr_0.8fr] items-center gap-8">
        <div className="lmd-rise">
          <h1 className="font-brand text-[2.8rem] sm:text-6xl md:text-7xl leading-[1] text-wine max-w-[14ch]">{title}</h1>
          {intro && <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft">{intro}</p>}
        </div>

        <div aria-hidden className="hidden md:flex relative justify-end h-[260px] lmd-rise" style={{ animationDelay: "0.12s" }}>
          <div className="absolute right-[26%] bottom-0 h-[250px] w-[170px] rounded-t-[999px] rounded-b-[1.5rem] bg-blush-edge flex items-end justify-center pb-4">
            <PerfumeBottle className="h-[84%]" label="D" />
          </div>
          <div className="absolute right-[2%] bottom-0 h-[130px] w-[110px] rounded-[1.5rem] bg-rose flex items-end justify-center pb-3">
            <LipstickArt className="h-[86%]" />
          </div>
          <div className="absolute right-[2%] top-2 h-[96px] w-[140px] rounded-[1.5rem] bg-blush flex items-center justify-center">
            <CreamJar className="w-[74%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
