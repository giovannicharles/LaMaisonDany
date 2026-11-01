import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, X } from "lucide-react";
import { useSite } from "@/lib/siteContent";
import { EASE } from "@/lib/motion";
import WhatsAppIcon from "./WhatsAppIcon";

function fullNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 9 ? `237${digits}` : digits;
}

export default function DeveloperContact() {
  const { texts } = useSite();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!texts.footer_credit.trim()) return null;

  const number = fullNumber(texts.credit_phone);
  const email = texts.credit_email.trim();
  const hello = encodeURIComponent(texts.credit_message);

  const choices = [
    number && { key: "wa", label: texts.credit_choice_whatsapp, hint: `+${number}`, href: `https://wa.me/${number}?text=${hello}`, external: true, icon: <WhatsAppIcon className="h-5 w-5" /> },
    number && { key: "call", label: texts.credit_choice_call, hint: `+${number}`, href: `tel:+${number}`, external: false, icon: <Phone className="h-5 w-5" /> },
    email && { key: "mail", label: texts.credit_choice_email, hint: email, href: `mailto:${email}?subject=${encodeURIComponent(texts.credit_mail_subject)}&body=${hello}`, external: false, icon: <Mail className="h-5 w-5" /> },
  ].filter(Boolean) as { key: string; label: string; hint: string; href: string; external: boolean; icon: React.ReactNode }[];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex min-h-9 items-center gap-1.5 font-medium text-blush/80 underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        {texts.footer_credit}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label={texts.credit_close} className="absolute inset-0 bg-wine-deep/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={texts.credit_contact_title}
              className="lmd relative w-full max-w-md rounded-[1.75rem] bg-blush p-6 text-ink shadow-2xl ring-1 ring-blush-edge"
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button onClick={() => setOpen(false)} aria-label={texts.credit_close} className="absolute right-3 top-3 rounded-full p-2.5 text-wine hover:bg-blush-deep">
                <X className="h-5 w-5" />
              </button>
              <p className="pr-8 font-brand text-2xl leading-tight text-wine [text-wrap:balance]">{texts.credit_contact_title}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{texts.credit_contact_text}</p>

              <ul className="mt-5 space-y-2.5">
                {choices.map((c) => (
                  <li key={c.key}>
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onClick={() => setOpen(false)}
                      className="group flex min-h-14 items-center gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-blush-edge transition-all hover:-translate-y-0.5 hover:ring-rose"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wine text-blush">{c.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-wine">{c.label}</span>
                        <span className="block truncate text-sm text-ink-soft">{c.hint}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
