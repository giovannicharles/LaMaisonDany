import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import ChatBot from "./ChatBot";
import Preloader from "./Preloader";
import { OrderProvider } from "./OrderDialog";
import { EASE } from "@/lib/motion";
import { SiteProvider } from "@/lib/siteContent";

const SEEN_KEY = "lmd_intro_seen";

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const [intro, setIntro] = useState(() => !alreadySeen());

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setIntro(false);
  }, []);

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
    <MotionConfig reducedMotion="user">
      <SiteProvider>
      <OrderProvider>
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
                <Outlet />
              </motion.main>
              <Footer />
              <aside aria-label="Aide et contact rapide">
                <ChatBot />
                <WhatsAppButton />
              </aside>
            </>
          )}
        </div>
      </OrderProvider>
      </SiteProvider>
    </MotionConfig>
  );
}
