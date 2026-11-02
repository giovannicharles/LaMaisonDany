import { useEffect, useRef, useState } from "react";
import WaveDivider from "@/components/public/WaveDivider";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Product } from "@/types";
import BrandMarquee from "@/components/public/BrandMarquee";
import HeroSlides from "@/components/public/HeroSlides";
import CategoryTiles from "@/components/public/CategoryTiles";
import Faq from "@/components/public/Faq";
import HowToOrder from "@/components/public/HowToOrder";
import ProductCard from "@/components/public/ProductCard";
import SplitLines from "@/components/public/SplitLines";
import VideoReels from "@/components/public/VideoReels";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { ProductGridSkeleton } from "@/components/public/Skeleton";
import RecentlyViewed from "@/components/public/RecentlyViewed";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { EASE } from "@/lib/motion";
import { optimizeImage } from "@/lib/images";
import { pickPhotos, useShowcase } from "@/lib/showcase";
import { iconFor, useSite } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";
import { richLines } from "@/components/public/Rich";
import { organizationLd } from "@/lib/seo";
import { CreamJar, PerfumeBottle, WineBottle } from "@/components/art/Bottles";
import { Waves } from "@/components/art/Ornaments";

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
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const photos = pickPhotos(showcase, 6);
  const slideshow = o.hero_background === "slideshow";
  const slides = o.hero_images.length > 0 ? o.hero_images : photos.slice(0, 5);
  const hasPhotos = photos.length >= 3;

  const heroProof = site.texts.hero_proof.split("\n").map((w) => w.trim()).filter(Boolean);

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
        {slideshow && slides.length > 0 && (
          <>
            <HeroSlides images={slides} interval={o.hero_interval} pauseLabel={site.texts.hero_slides_pause} playLabel={site.texts.hero_slides_play} />
            <div aria-hidden className="absolute inset-0 -z-10 max-lg:bg-blush/70 lg:bg-gradient-to-r lg:from-blush lg:via-blush/85 lg:to-blush/0" />
          </>
        )}

        <div className={`relative mx-auto grid min-h-[min(calc(100svh-72px),800px)] max-w-[1320px] items-center gap-10 px-5 py-10 md:px-10 md:py-16 lg:gap-6 ${slideshow && slides.length > 0 ? "lg:grid-cols-[minmax(0,640px)]" : "lg:grid-cols-[1.05fr_0.95fr]"}`}>
          <motion.div style={{ y: textY }}>
            <h1 className="font-brand text-[2.5rem] leading-[1] text-wine sm:text-6xl xl:text-[4.6rem]">
              <SplitLines
                delay={0.15}
                lines={[site.hero.line1, site.hero.line2, <span key="r" className="italic text-rose">{site.hero.accent}</span>]}
              />
            </h1>
            <motion.p {...fadeUp(0.75)} className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
              {site.hero.text}
            </motion.p>
            <motion.div {...fadeUp(0.95)} className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn lmd-btn-wine !px-8 !py-4 text-[1.05rem]">
                <WhatsAppIcon className="relative h-5 w-5" />
                <span className="relative">{site.hero.cta_primary}</span>
              </a>
              <Link to="/catalogue" className="lmd-btn lmd-btn-ghost group">
                {site.hero.cta_secondary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {heroProof.length > 0 && (
              <motion.ul {...fadeUp(1.05)} className="mt-8 flex flex-wrap gap-y-2 text-[0.95rem] text-ink-soft">
                {heroProof.map((t) => (
                  <li key={t} className="pr-5 sm:border-l sm:border-blush-edge sm:pl-4 sm:first:border-l-0 sm:first:pl-0">{t}</li>
                ))}
              </motion.ul>
            )}

          </motion.div>

          <motion.div style={{ y: collageY }} className={`relative mx-auto w-full max-w-[520px] ${slideshow && slides.length > 0 ? "hidden" : ""}`}>
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
                  <div className="relative flex h-[104px] w-[104px] items-center justify-center">
                  <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-blush text-center text-wine shadow-[0_18px_34px_-14px_rgba(107,23,48,0.55)]">
                    <span className="font-brand text-3xl italic leading-none">{site.hero.badge_title}</span>
                    <span className="mt-1 text-[0.7rem] font-medium">{site.hero.badge_text}</span>
                  </div>
                  </div>
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
      </section>
      <div id="apres-hero" className="scroll-mt-20" />

      {/* Reassurance */}
      {o.show_reassurance && (
      <>
      <WaveDivider from="bg-blush" to="text-wine" variant="soft" />
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

      <RecentlyViewed className="bg-blush-deep/40" />

      {o.show_videos && <VideoReels />}

      {/* About collage */}
      {o.show_about && (
      <>
      <WaveDivider from="bg-blush" to="text-blush-deep/60" variant="swell" />
      <section className="relative isolate overflow-hidden bg-blush-deep/60">
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
      <WaveDivider from="bg-blush-deep/60" to="text-blush" variant="ripple" />

      </>
      )}

      {/* How to order */}
      {o.show_howto && (
      <>
      <section className="relative isolate mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <Waves className="inset-x-0 top-1/3 h-24 w-full text-rose/20" />
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
      <WaveDivider from="bg-blush" to="text-wine" variant="layered" />
      <section ref={bannerRef} className="relative isolate overflow-hidden bg-wine text-blush">
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
      <WaveDivider from="bg-wine" to="text-wine-deep" variant="soft" />
    </>
  );
}
