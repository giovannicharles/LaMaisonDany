import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Product } from "@/types";
import CategoryTiles from "@/components/public/CategoryTiles";
import Faq from "@/components/public/Faq";
import HowToOrder from "@/components/public/HowToOrder";
import ProductCard from "@/components/public/ProductCard";
import SplitLines from "@/components/public/SplitLines";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { EASE } from "@/lib/motion";
import { optimizeImage } from "@/lib/images";
import { iconFor, useSite } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";
import { richLines } from "@/components/public/Rich";
import { organizationLd } from "@/lib/seo";
import { CreamJar, LipstickArt, PerfumeBottle, WineBottle } from "@/components/art/Bottles";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

export default function HomePage() {
  const site = useSite();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const archY = useTransform(heroScroll, [0, 1], [0, 70]);
  const bottleY = useTransform(heroScroll, [0, 1], [0, -50]);
  const textY = useTransform(heroScroll, [0, 1], [0, 40]);

  const bannerRef = useRef<HTMLElement>(null);
  const { scrollYProgress: bannerScroll } = useScroll({ target: bannerRef, offset: ["start end", "end start"] });
  const leftY = useTransform(bannerScroll, [0, 1], [110, -70]);
  const rightY = useTransform(bannerScroll, [0, 1], [70, -110]);
  const leftRot = useTransform(bannerScroll, [0, 1], [-20, -4]);
  const rightRot = useTransform(bannerScroll, [0, 1], [4, 20]);

  useEffect(() => {
    api.products.list({ featured: "true" })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const heroImage = site.hero.image_url;
  const heroAlt = site.general.brand;

  return (
    <>
      <Seo path="/" jsonLd={organizationLd(site, window.location.origin)} />
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden pt-[72px]">
        <motion.div
          aria-hidden
          className="absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-blush-deep blur-3xl opacity-80"
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-[1320px] mx-auto px-5 md:px-10 grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-10 lg:gap-6 py-12 md:py-20 min-h-[min(calc(100svh-72px),780px)]">
          <motion.div style={{ y: textY }}>
            <h1 className="font-brand text-[2.5rem] sm:text-6xl xl:text-[4.1rem] leading-[1] text-wine">
              <SplitLines
                delay={0.15}
                lines={[site.hero.line1, site.hero.line2, <span key="r" className="italic text-rose">{site.hero.accent}</span>]}
              />
            </h1>
            <motion.p {...fadeUp(0.75)} className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
              {site.hero.text}
            </motion.p>
            <motion.div {...fadeUp(0.95)} className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn lmd-btn-wine">
                <WhatsAppIcon className="h-5 w-5" />
                {site.hero.cta_primary}
              </a>
              <Link to="/catalogue" className="lmd-btn lmd-btn-ghost group">
                {site.hero.cta_secondary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative mx-auto w-full max-w-[460px]">
            <motion.div
              style={{ y: archY }}
              initial={{ clipPath: "inset(100% 0 0 0 round 999px 999px 40px 40px)", opacity: 0 }}
              animate={{ clipPath: "inset(0% 0 0 0 round 999px 999px 40px 40px)", opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
              className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-blush-edge to-rose/70"
            >
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-wine/25 to-transparent" />
              <motion.div
                style={{ y: bottleY }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
                className="absolute inset-0 flex items-end justify-center pb-[9%]"
              >
                {heroImage ? (
                  <img
                    src={optimizeImage(heroImage, 900)}
                    alt={heroAlt}
                    className="lmd-float h-[78%] w-auto max-w-[80%] object-contain drop-shadow-[0_24px_24px_rgba(74,15,34,0.35)]"
                  />
                ) : (
                  <div className="relative h-[82%] w-[88%] drop-shadow-[0_24px_24px_rgba(74,15,34,0.3)]">
                    <WineBottle className="absolute bottom-0 left-[2%] h-[88%] -rotate-6" label="D" />
                    <PerfumeBottle className="lmd-float absolute bottom-0 left-1/2 h-[100%] -translate-x-1/2" />
                    <CreamJar className="absolute bottom-0 right-[-4%] w-[46%]" />
                  </div>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              aria-hidden
              className="absolute -left-3 sm:-left-8 top-[18%]"
              initial={{ scale: 0, rotate: -50 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 160, damping: 11, delay: 1.5 }}
            >
              <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-blush text-center text-wine shadow-[0_18px_34px_-14px_rgba(107,23,48,0.55)]">
                <span className="font-brand text-3xl italic leading-none">{site.hero.badge_title}</span>
                <span className="mt-1 text-[0.7rem] font-medium">{site.hero.badge_text}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="bg-wine text-blush" aria-label="Nos engagements">
        <motion.ul
          className="max-w-[1320px] mx-auto px-5 md:px-10 py-8 grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        >
          {site.reassurance.map((item) => {
            const Icon = iconFor(item.icon);
            return (
              <motion.li
                key={item.title}
                className="group flex items-start gap-3.5"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
                }}
              >
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush/12 ring-1 ring-blush/25 transition-all duration-500 group-hover:bg-blush group-hover:rotate-[10deg] group-hover:scale-110">
                  <Icon className="h-5 w-5 text-blush-edge transition-colors duration-500 group-hover:text-wine" strokeWidth={1.6} />
                </span>
                <div>
                  <p className="font-medium leading-tight">{item.title}</p>
                  <p className="mt-1 text-sm leading-snug text-blush/70">{item.text}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </section>

      {/* Categories */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-10 pt-24 md:pt-32">
        <h2 className="font-brand text-4xl md:text-6xl leading-[1.03] text-wine mb-10 md:mb-14">
          <SplitLines onView lines={richLines(site.texts.home_categories_title, site.general.brand)} />
        </h2>
        <CategoryTiles />
      </section>

      {/* Featured */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-10 py-24 md:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <h2 className="font-brand text-4xl md:text-6xl leading-[1.03] text-wine">
            <SplitLines onView lines={richLines(site.texts.home_featured_title, site.general.brand)} />
          </h2>
          <ScrollReveal direction="left">
            <Link to="/catalogue" className="lmd-btn lmd-btn-ghost group self-start sm:self-auto">
              {site.texts.home_featured_button}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[1.75rem] bg-blush-deep animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white/60 px-6 py-16 text-center">
            <p className="font-brand text-2xl text-wine">{site.texts.home_featured_empty_title}</p>
            <p className="mt-2 text-ink-soft">{site.texts.home_featured_empty_text}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 8).map((p, i) => (
              <ScrollReveal key={p.id} delay={(i % 4) * 90}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* About collage */}
      <section className="bg-blush-deep/60">
        <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-24 md:py-32 grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          <motion.div
            className="relative mx-auto w-full max-w-[520px] aspect-[1/1.02]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18 } } }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 60, scale: 0.94 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.1, ease: EASE } },
              }}
              className="absolute left-0 top-0 h-[78%] w-[62%] rounded-t-[999px] rounded-b-[1.75rem] bg-blush-edge flex items-end justify-center pb-6"
            >
              <PerfumeBottle className="h-[82%]" label="D" />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 50, rotate: 6 },
                show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 1.1, ease: EASE } },
              }}
              className="absolute right-0 top-[10%] h-[44%] w-[40%] rounded-[1.75rem] bg-wine flex items-end justify-center pb-3"
            >
              <WineBottle className="h-[88%]" />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, x: 30 },
                show: { opacity: 1, y: 0, x: 0, transition: { duration: 1.1, ease: EASE } },
              }}
              className="absolute bottom-0 right-[4%] h-[38%] w-[66%] rounded-[1.75rem] bg-blush flex items-center justify-center gap-2"
            >
              <CreamJar className="w-[50%]" />
              <LipstickArt className="h-[78%]" />
            </motion.div>
          </motion.div>

          <div>
            <h2 className="font-brand text-4xl md:text-6xl leading-[1.03] text-wine">
              <SplitLines
                onView
                lines={[site.about_home.line1, <span key="l2">{site.about_home.line2} <span className="italic text-rose">{site.about_home.accent}</span></span>]}
              />
            </h2>
            <ScrollReveal delay={250}>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-soft">{site.about_home.text}</p>
              <Link to="/a-propos" className="lmd-btn lmd-btn-ghost group mt-8">
                {site.about_home.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-10 py-24 md:py-32">
        <h2 className="font-brand text-4xl md:text-6xl leading-[1.03] text-wine mb-10 md:mb-14">
          <SplitLines onView lines={richLines(site.texts.home_howto_title, site.general.brand)} />
        </h2>
        <HowToOrder />
      </section>

      {/* FAQ */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-10 pb-24 md:pb-32 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20">
        <div>
          <h2 className="font-brand text-4xl md:text-5xl leading-[1.05] text-wine">
            <SplitLines onView lines={richLines(site.texts.home_faq_title, site.general.brand)} />
          </h2>
          <p className="mt-5 max-w-[34ch] text-ink-soft leading-relaxed">
            {site.texts.home_faq_text}
          </p>
        </div>
        <ScrollReveal>
          <Faq />
        </ScrollReveal>
      </section>

      {/* Final banner */}
      <section ref={bannerRef} className="relative overflow-hidden bg-gradient-to-br from-wine to-wine-deep text-blush">
        <motion.div aria-hidden style={{ y: leftY, rotate: leftRot }} className="absolute -left-16 bottom-0 hidden lg:block">
          <PerfumeBottle className="h-[400px]" label="LD" />
        </motion.div>
        <motion.div aria-hidden style={{ y: rightY, rotate: rightRot }} className="absolute -right-6 bottom-0 hidden lg:block">
          <WineBottle className="h-[400px]" />
        </motion.div>
        <div className="relative max-w-4xl mx-auto px-5 py-28 md:py-40 text-center">
          <h2 className="font-brand text-5xl md:text-7xl leading-[1.02]">
            <SplitLines
              onView
              lines={[site.banner.line1, <span key="l2" className="italic text-blush-edge">{site.banner.accent}</span>]}
            />
          </h2>
          <ScrollReveal delay={300}>
            <p className="mt-6 text-lg text-blush/80 max-w-[46ch] mx-auto">{site.banner.text}</p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="lmd-btn mt-10 bg-blush text-wine hover:bg-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {site.banner.cta}
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
