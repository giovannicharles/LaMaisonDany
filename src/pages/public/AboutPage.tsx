import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "@/api/client";
import type { Page } from "@/types";
import { useSite } from "@/lib/siteContent";
import PageHeader from "@/components/public/PageHeader";
import Faq from "@/components/public/Faq";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { CreamJar, PerfumeBottle, WineBottle } from "@/components/art/Bottles";

export default function AboutPage() {
  const site = useSite();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pages.get("about")
      .then((res) => setPage(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={<>À propos de <span className="italic text-rose">{site.general.brand}</span></>} />

      <section className="max-w-[1320px] mx-auto px-5 md:px-10 py-20 md:py-28 grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">
        <ScrollReveal>
          <div className="relative mx-auto max-w-[500px] aspect-square">
            <div className="absolute left-0 top-0 h-[80%] w-[60%] rounded-t-[999px] rounded-b-[1.75rem] bg-blush-edge flex items-end justify-center pb-6">
              <PerfumeBottle className="h-[82%]" label="D" />
            </div>
            <div className="absolute right-0 top-[8%] h-[46%] w-[40%] rounded-[1.75rem] bg-wine flex items-end justify-center pb-3">
              <WineBottle className="h-[88%]" />
            </div>
            <div className="absolute bottom-0 right-[4%] h-[36%] w-[64%] rounded-[1.75rem] bg-blush-deep flex items-center justify-center">
              <CreamJar className="w-[72%]" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <h2 className="font-brand text-3xl md:text-5xl leading-[1.05] text-wine">
            Notre <span className="italic text-rose">histoire</span>
          </h2>
          {loading ? (
            <div className="mt-6 space-y-3 animate-pulse">
              <div className="h-4 w-full rounded-full bg-blush-deep" />
              <div className="h-4 w-5/6 rounded-full bg-blush-deep" />
              <div className="h-4 w-4/6 rounded-full bg-blush-deep" />
            </div>
          ) : (
            <p className="mt-6 max-w-[56ch] whitespace-pre-line text-lg leading-relaxed text-ink-soft">
              {page?.content || site.about_home.text}
            </p>
          )}
        </ScrollReveal>
      </section>

      <section className="max-w-[1320px] mx-auto px-5 md:px-10 pb-20 md:pb-28">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {site.values.map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 90}>
              <div className="h-full rounded-[1.75rem] bg-white/70 p-8 md:p-10">
                <h3 className="font-brand text-3xl text-wine">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="bg-blush-deep/60">
        <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-20 md:py-28 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20">
          <div>
            <h2 className="font-brand text-4xl md:text-5xl leading-[1.05] text-wine">
              Questions <span className="italic text-rose">fréquentes</span>
            </h2>
            <Link to="/catalogue" className="lmd-btn lmd-btn-wine mt-8">
              Voir la boutique
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Faq />
        </div>
      </section>
    </div>
  );
}
