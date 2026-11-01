import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import ChatBot from "./ChatBot";
import Preloader from "./Preloader";
import BackToTop from "./BackToTop";
import InstallPrompt from "./InstallPrompt";
import { OrderProvider } from "./OrderDialog";
import { EASE } from "@/lib/motion";
import { SiteProvider, useSite } from "@/lib/siteContent";
import { whatsappLink } from "@/api/client";
import WhatsAppIcon from "./WhatsAppIcon";

const SEEN_KEY = "lmd_intro_seen";

function skipIntro() {
  try {
    return localStorage.getItem("lmd_no_intro") === "1";
  } catch {
    return false;
  }
}

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function Shell() {
  const { options, general, texts } = useSite();
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const [intro, setIntro] = useState(() => !alreadySeen() && !skipIntro());

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setIntro(false);
  }, []);

  useEffect(() => {
    if (!options.show_preloader) finishIntro();
  }, [options.show_preloader, finishIntro]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = intro ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [intro]);

  return (
    <div className="lmd min-h-screen flex flex-col">
          {intro && <Preloader onDone={finishIntro} />}
          {!intro && (
            <>
              <motion.div
                aria-hidden
                className="fixed top-0 inset-x-0 z-50 h-[3px] origin-left bg-gradient-to-r from-rose to-wine"
                style={{ scaleX: progress }}
              />
              <Navbar />
              <motion.main
                key={pathname}
                className="flex-1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {options.maintenance ? (
                  <section className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center px-5 pt-[120px] text-center">
                    <h1 className="font-brand text-5xl text-wine">{general.brand}</h1>
                    <p className="mt-5 text-lg leading-relaxed text-ink-soft">{options.maintenance_text}</p>
                    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn lmd-btn-wine mt-8">
                      <WhatsAppIcon className="h-5 w-5" />
                      {texts.footer_cta}
                    </a>
                  </section>
                ) : (
                  <Outlet />
                )}
              </motion.main>
              <Footer />
              <aside aria-label="Aide et contact rapide">
                <ChatBot />
                <BackToTop />
                <InstallPrompt />
                {options.show_floating_whatsapp && <WhatsAppButton />}
              </aside>
            </>
          )}
        </div>
  );
}

export default function PublicLayout() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteProvider>
        <OrderProvider>
          <Shell />
        </OrderProvider>
      </SiteProvider>
    </MotionConfig>
  );
}
