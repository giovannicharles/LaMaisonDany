import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { usePwaInstall } from "@/lib/pwa";
import { useSite } from "@/lib/siteContent";
import { EASE } from "@/lib/motion";

const KEY = "lmd_install_dismissed";
const SNOOZE_DAYS = 7;
const DELAY_MS = 5000;

function snoozed() {
  try {
    const at = Number(localStorage.getItem(KEY) || 0);
    return at > 0 && Date.now() - at < SNOOZE_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const { texts, options, general } = useSite();
  const pwa = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const available = options.show_install_button && !pwa.installed && (pwa.canInstall || pwa.showIosHint);

  useEffect(() => {
    if (!available || snoozed()) return;
    const t = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [available]);

  useEffect(() => {
    if (!available) setVisible(false);
  }, [available]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* stockage indisponible */
    }
  };

  const install = async () => {
    await pwa.install();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          role="dialog"
          aria-label={texts.install_prompt_title}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="lmd fixed inset-x-4 bottom-4 z-[75] max-md:bottom-[76px] mx-auto max-w-md rounded-[1.5rem] bg-white p-5 sm:inset-x-auto sm:left-5 sm:mx-0 sm:max-w-sm shadow-[0_30px_70px_-25px_rgba(74,15,34,0.6)] ring-1 ring-blush-edge sm:bottom-6"
        >
          <button onClick={dismiss} aria-label={texts.install_prompt_later} className="absolute right-3 top-3 rounded-full p-2 text-ink-soft transition-colors hover:bg-blush-deep hover:text-wine">
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <img src="/icon-192.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-2xl shadow-md" />
            <div className="min-w-0 pr-6">
              <p className="font-brand text-xl leading-tight text-wine">{texts.install_prompt_title}</p>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
                {pwa.canInstall ? texts.install_prompt_text : texts.install_prompt_ios}
              </p>
              <p className="sr-only">{general.brand}</p>
            </div>
          </div>

          {pwa.canInstall ? (
            <div className="mt-4 flex gap-3">
              <button onClick={install} className="lmd-btn lmd-btn-wine flex-1 !py-3">
                <Download className="h-4 w-4" />
                {texts.install_prompt_button}
              </button>
              <button onClick={dismiss} className="lmd-btn lmd-btn-ghost !py-3">
                {texts.install_prompt_later}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">
              <span className="flex items-center gap-2">
                <Share className="h-4 w-4 shrink-0" />
                {texts.install_prompt_ios_hint}
              </span>
              <button onClick={dismiss} className="shrink-0 font-medium underline underline-offset-2">
                {texts.install_prompt_later}
              </button>
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
