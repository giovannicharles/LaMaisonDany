import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Product } from "@/types";
import BrandMarquee from "@/components/public/BrandMarquee";
import CategoryTiles from "@/components/public/CategoryTiles";
import Faq from "@/components/public/Faq";
import HowToOrder from "@/components/public/HowToOrder";
import ProductCard from "@/components/public/ProductCard";
import SplitLines from "@/components/public/SplitLines";
import VideoReels from "@/components/public/VideoReels";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { ProductGridSkeleton } from "@/components/public/Skeleton";
import CountUp from "@/components/public/CountUp";
import { CircularText, HeroSpotlight, RotatingWords, ScrollCue } from "@/components/public/HeroExtras";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { EASE } from "@/lib/motion";
import { optimizeImage } from "@/lib/images";
import { pickPhotos, useShowcase, useShowcaseReady } from "@/lib/showcase";
import { iconFor, useSite } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";
import { richLines } from "@/components/public/Rich";
import { organizationLd } from "@/lib/seo";
import { CreamJar, PerfumeBottle, WineBottle } from "@/components/art/Bottles";
import { Arches, DotGrid, Rings, Sparkle, Sprig, Vine, Waves } from "@/components/art/Ornaments";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

function Photo({ src, className, eager = false }: { src: string; className?: string; eager?: boolean }) {
  return (
    <img
      src={optimizeImage(src, 800)}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`h-full w-full object-cover ${className ?? ""}`}
    />
  );
}

export default function HomePage() {
  const site = useSite();
  const o = site.options;
  const showcase = useShowcase();
  const showcaseReady = useShowcaseReady();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const photos = pickPhotos(showcase, 6);
  const hasPhotos = photos.length >= 3;
  const categoriesCount = new Set(showcase.map((p) => p.category_id).filter((c) => c != null)).size;

  const heroWords = site.texts.hero_words.split("\n").map((w) => w.trim()).filter(Boolean);
  const heroProof = site.texts.hero_proof.split("\n").map((w) => w.trim()).filter(Boolean);
  const spotlight = featured.length >= 3 ? featured : showcase;

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const collageY = useTransform(heroScroll, [0, 1], [0, 60]);
  const textY = useTransform(heroScroll, [0, 1], [0, 36]);

  const bannerRef = useRef<HTMLElement>(null);
  const { scrollYProgress: bannerScroll } = useScroll({ target: bannerRef, offset: ["start end", "end start"] });
  const leftY = useTransform(bannerScroll, [0, 1], [90, -60]);
  const rightY = useTransform(bannerScroll, [0, 1], [60, -90]);
  const leftRot = useTransform(bannerScroll, [0, 1], [-14, -4]);
  const rightRot = useTransform(bannerScroll, [0, 1], [4, 14]);

  useEffect(() => {
    api.products
      .list({ featured: "true" })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo path="/" jsonLd={organizationLd(site, window.location.origin)} />

      {/* Hero */}
      <section ref={heroRef} className="relative isolate overflow-hidden pt-[108px]">
        <Rings className="lmd-spin -left-40 top-24 h-[520px] w-[520px] text-rose/15" />
        <Sprig className="-right-6 top-20 hidden h-[420px] rotate-12 text-wine/15 lg:block" />
        <Sparkle className="lmd-float left-[8%] top-[34%] h-6 w-6 text-rose/50" />
        <Sparkle className="lmd-float bottom-24 right-[44%] h-4 w-4 text-wine/40" style={{ animationDelay: "1.4s" }} />
        <DotGrid className="bottom-10 left-6 h-28 w-28 text-wine/15" />
        <motion.div
          aria-hidden
          className="absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-blush-deep opacity-80 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto grid min-h-[min(calc(100svh-72px),800px)] max-w-[1320px] items-center gap-10 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <motion.div style={{ y: textY }}>
            {site.texts.hero_eyebrow.trim() && (
              <motion.p {...fadeUp(0)} className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-wine shadow-sm ring-1 ring-blush-edge backdrop-blur">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                {site.texts.hero_eyebrow}
              </motion.p>
            )}
            <h1 className="font-brand text-[2.5rem] leading-[1] text-wine sm:text-6xl xl:text-[4.6rem]">
              <SplitLines
                delay={0.15}
                lines={[site.hero.line1, site.hero.line2, <span key="r" className="italic text-rose">{site.hero.accent}</span>]}
              />
            </h1>
            {heroWords.length > 0 && (
              <motion.p {...fadeUp(0.65)} className="mt-6 font-brand text-2xl text-wine sm:text-3xl">
                {site.texts.hero_words_prefix} <RotatingWords words={heroWords} />
              </motion.p>
            )}
            <motion.p {...fadeUp(0.75)} className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
              {site.hero.text}
            </motion.p>
            <motion.div {...fadeUp(0.95)} className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn lmd-btn-wine group relative overflow-hidden !px-8 !py-4 text-[1.05rem] shadow-[0_18px_34px_-14px_rgba(107,23,48,0.7)]">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-[420%]" />
                <WhatsAppIcon className="relative h-5 w-5" />
                <span className="relative">{site.hero.cta_primary}</span>
              </a>
              <Link to="/catalogue" className="lmd-btn lmd-btn-ghost group">
                {site.hero.cta_secondary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {heroProof.length > 0 && (
              <motion.ul {...fadeUp(1.05)} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                {heroProof.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </motion.ul>
            )}

            {showcaseReady && showcase.length > 0 && (
              <motion.dl {...fadeUp(1.15)} className="mt-9 flex gap-8 border-t border-blush-edge/70 pt-6 text-wine">
                <div>
                  <dt className="sr-only">Produits</dt>
                  <dd className="font-brand text-4xl leading-none"><CountUp to={showcase.length} /></dd>
                  <dd className="mt-1 text-sm text-ink-soft">{site.texts.stats_products}</dd>
                </div>
                <div>
                  <dt className="sr-only">Univers</dt>
                  <dd className="font-brand text-4xl leading-none"><CountUp to={categoriesCount} /></dd>
                  <dd className="mt-1 text-sm text-ink-soft">{site.texts.stats_categories}</dd>
                </div>
              </motion.dl>
            )}
          </motion.div>

          <motion.div style={{ y: collageY }} className="relative mx-auto w-full max-w-[520px]">
            {hasPhotos ? (
              <div className="relative aspect-[1/1.04]">
                <motion.div
                  className="absolute bottom-0 left-0 h-[92%] w-[60%] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-blush-edge shadow-[0_40px_60px_-36px_rgba(107,23,48,0.65)]"
                  initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
                  animate={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
                  transition={{ duration: 1.3, delay: 0.2, ease: EASE }}
                >
                  <Photo src={photos[0]} eager />
                </motion.div>
                <motion.div
                  className="absolute right-0 top-0 h-[43%] w-[42%] overflow-hidden rounded-[1.75rem] bg-blush-edge shadow-[0_30px_50px_-30px_rgba(107,23,48,0.6)] ring-4 ring-blush"
                  initial={{ opacity: 0, y: 40, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.6, ease: EASE }}
                >
                  <Photo src={photos[1]} eager />
                </motion.div>
                <motion.div
                  className="absolute bottom-[3%] right-[1%] h-[40%] w-[44%] overflow-hidden rounded-[1.75rem] bg-blush-edge shadow-[0_30px_50px_-30px_rgba(107,23,48,0.6)] ring-4 ring-blush"
                  initial={{ opacity: 0, y: 40, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.8, ease: EASE }}
                >
                  <Photo src={photos[2]} />
                </motion.div>
                <motion.div
                  aria-hidden
                  className="absolute -left-2 top-[14%] sm:-left-6"
                  initial={{ scale: 0, rotate: -50 }}
                  animate={{ scale: 1, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 160, damping: 11, delay: 1.4 }}
                >
                  <div className="relative flex h-[120px] w-[120px] items-center justify-center">
                    <CircularText text={site.texts.hero_badge_ring} className="absolute inset-0 h-full w-full text-rose/80 [animation-duration:24s]" />
                  <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-blush text-center text-wine shadow-[0_18px_34px_-14px_rgba(107,23,48,0.55)]">
                    <span className="font-brand text-3xl italic leading-none">{site.hero.badge_title}</span>
                    <span className="mt-1 text-[0.62rem] font-medium leading-tight">{site.hero.badge_text}</span>
                  </div>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 left-1/2 z-10 -translate-x-[42%] sm:-translate-x-[36%]"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.6, ease: EASE }}
                >
                  <HeroSpotlight products={spotlight} />
                </motion.div>
              </div>
            ) : (
              <div className="relative aspect-[4/5] max-w-[460px] mx-auto overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] bg-gradient-to-b from-blush-edge to-rose/70">
                <div className="absolute inset-0 flex items-end justify-center pb-[9%]">
                  <div className="relative h-[82%] w-[88%] drop-shadow-[0_24px_24px_rgba(74,15,34,0.3)]">
                    <WineBottle className="absolute bottom-0 left-[2%] h-[88%] -rotate-6" label="D" />
                    <PerfumeBottle className="lmd-float absolute bottom-0 left-1/2 h-[100%] -translate-x-1/2" />
                    <CreamJar className="absolute bottom-0 right-[-4%] w-[46%]" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        <ScrollCue label={site.texts.hero_scroll} />
      </section>
      <div id="apres-hero" className="scroll-mt-20" />

      {/* Reassurance */}
      {o.show_reassurance && (
      <>
      <section className="bg-wine text-blush" aria-label="Nos engagements">
        <motion.ul
          className="mx-auto grid max-w-[1320px] grid-cols-1 gap-x-6 gap-y-6 px-5 py-8 md:px-10 min-[520px]:grid-cols-2 lg:grid-cols-4"
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
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush/12 ring-1 ring-blush/25 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:bg-blush">
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

      </>
      )}

      {o.show_brands && <BrandMarquee />}

      {/* Categories */}
      {o.show_categories && (
      <>
      <section className="relative isolate mx-auto max-w-[1320px] px-5 pt-24 md:px-10 md:pt-32">
        <Arches className="-right-10 top-16 hidden h-[360px] text-wine/10 md:block" />
        <Sparkle className="lmd-float right-[12%] top-24 h-5 w-5 text-rose/40" />
        <h2 className="mb-10 font-brand text-4xl leading-[1.03] text-wine md:mb-14 md:text-6xl">
          <SplitLines onView lines={richLines(site.texts.home_categories_title, site.general.brand)} />
        </h2>
        <CategoryTiles />
      </section>

      </>
      )}

      {/* Featured */}
      {o.show_featured && (
      <>
      <section className="relative isolate mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <Vine className="-left-14 top-10 hidden h-[300px] text-rose/20 xl:block" />
        <DotGrid className="-right-4 bottom-20 hidden h-32 w-32 text-wine/10 md:block" />
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <h2 className="font-brand text-4xl leading-[1.03] text-wine md:text-6xl">
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
          <ProductGridSkeleton count={4} className="md:grid-cols-4 xl:grid-cols-4" />
        ) : featured.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-blush-edge/60">
            <p className="font-brand text-2xl text-wine">{site.texts.home_featured_empty_title}</p>
            <p className="mt-2 text-ink-soft">{site.texts.home_featured_empty_text}</p>
          </div>
        ) : (
          <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4">
            {featured.slice(0, 8).map((p, i) => (
              <li key={p.id} className="w-[68vw] max-w-[290px] shrink-0 snap-start md:w-auto md:max-w-none">
                <ScrollReveal delay={(i % 4) * 90}>
                  <ProductCard product={p} />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      </>
      )}

      {o.show_videos && <VideoReels />}

      {/* About collage */}
      {o.show_about && (
      <>
      <section className="relative isolate overflow-hidden bg-blush-deep/60">
        <Rings className="lmd-spin -right-52 -top-40 h-[620px] w-[620px] text-wine/10" />
        <Sprig className="-left-8 bottom-0 hidden h-[360px] -rotate-12 text-wine/15 lg:block" />
        <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-2 lg:gap-24">
          <motion.div
            className="relative mx-auto aspect-[1/1.02] w-full max-w-[520px]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18 } } }}
          >
            {photos.length >= 6 ? (
              <>
                {[
                  { cls: "left-0 top-0 h-[74%] w-[60%] rounded-t-[999px] rounded-b-[1.75rem]", i: 3, v: { y: 60, scale: 0.94 } },
                  { cls: "right-0 top-[8%] h-[42%] w-[38%] rounded-[1.75rem]", i: 4, v: { x: 50, rotate: 5 } },
                  { cls: "bottom-0 right-[3%] h-[40%] w-[64%] rounded-[1.75rem]", i: 5, v: { y: 50, x: 30 } },
                ].map((c) => (
                  <motion.div
                    key={c.i}
                    className={`absolute overflow-hidden bg-blush-edge shadow-[0_30px_50px_-30px_rgba(107,23,48,0.55)] ${c.cls}`}
                    variants={{ hidden: { opacity: 0, ...c.v }, show: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, transition: { duration: 1.1, ease: EASE } } }}
                  >
                    <Photo src={photos[c.i]} />
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } } }}
                  className="absolute left-0 top-0 flex h-[78%] w-[62%] items-end justify-center rounded-t-[999px] rounded-b-[1.75rem] bg-blush-edge pb-6"
                >
                  <PerfumeBottle className="h-[82%]" label="D" />
                </motion.div>
                <motion.div
                  variants={{ hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0, transition: { duration: 1.1, ease: EASE } } }}
                  className="absolute right-0 top-[10%] flex h-[44%] w-[40%] items-end justify-center rounded-[1.75rem] bg-wine pb-3"
                >
                  <WineBottle className="h-[88%]" />
                </motion.div>
              </>
            )}
          </motion.div>

          <div>
            <h2 className="font-brand text-4xl leading-[1.03] text-wine md:text-6xl">
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

      </>
      )}

      {/* How to order */}
      {o.show_howto && (
      <>
      <section className="relative isolate mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <Waves className="inset-x-0 top-1/3 h-24 w-full text-rose/20" />
        <Sparkle className="lmd-float right-[6%] top-20 h-6 w-6 text-wine/40" />
        <h2 className="mb-10 font-brand text-4xl leading-[1.03] text-wine md:mb-14 md:text-6xl">
          <SplitLines onView lines={richLines(site.texts.home_howto_title, site.general.brand)} />
        </h2>
        <HowToOrder />
      </section>

      </>
      )}

      {/* FAQ */}
      {o.show_faq && (
      <>
      <section className="relative isolate mx-auto grid max-w-[1320px] gap-10 px-5 pb-24 md:px-10 md:pb-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="font-brand text-4xl leading-[1.05] text-wine md:text-5xl">
            <SplitLines onView lines={richLines(site.texts.home_faq_title, site.general.brand)} />
          </h2>
          <p className="mt-5 max-w-[34ch] leading-relaxed text-ink-soft">{site.texts.home_faq_text}</p>
        </div>
        <ScrollReveal>
          <Faq />
        </ScrollReveal>
      </section>

      </>
      )}

      {/* Final banner */}
      <section ref={bannerRef} className="relative isolate overflow-hidden bg-gradient-to-br from-wine to-wine-deep text-blush">
        <Rings className="lmd-spin -left-40 -top-40 h-[560px] w-[560px] text-blush/10" />
        <Rings className="lmd-spin -bottom-52 -right-40 h-[620px] w-[620px] text-blush/10" />
        <Sparkle className="lmd-float left-[20%] top-16 h-6 w-6 text-blush/50" />
        <Sparkle className="lmd-float bottom-20 right-[22%] h-4 w-4 text-blush/40" style={{ animationDelay: "1.2s" }} />
        {hasPhotos && (
          <>
            <motion.div
              aria-hidden
              style={{ y: leftY, rotate: leftRot }}
              className="absolute -left-10 bottom-[-4rem] hidden h-[340px] w-[250px] overflow-hidden rounded-[1.75rem] opacity-90 ring-4 ring-blush/20 lg:block xl:left-10"
            >
              <Photo src={photos[1]} />
            </motion.div>
            <motion.div
              aria-hidden
              style={{ y: rightY, rotate: rightRot }}
              className="absolute -right-10 bottom-[-3rem] hidden h-[360px] w-[260px] overflow-hidden rounded-[1.75rem] opacity-90 ring-4 ring-blush/20 lg:block xl:right-10"
            >
              <Photo src={photos[0]} />
            </motion.div>
          </>
        )}
        <div className="relative mx-auto max-w-4xl px-5 py-28 text-center md:py-40">
          <h2 className="font-brand text-5xl leading-[1.02] md:text-7xl">
            <SplitLines
              onView
              lines={[site.banner.line1, <span key="l2" className="italic text-blush-edge">{site.banner.accent}</span>]}
            />
          </h2>
          <ScrollReveal delay={300}>
            <p className="mx-auto mt-6 max-w-[46ch] text-lg text-blush/80">{site.banner.text}</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn mt-10 bg-blush text-wine hover:bg-white">
              <WhatsAppIcon className="h-5 w-5" />
              {site.banner.cta}
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
