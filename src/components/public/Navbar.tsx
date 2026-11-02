import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { Clock, Heart, Menu, Phone, Search, X } from "lucide-react";
import ShopMenu from "./ShopMenu";
import { useFavorites } from "@/lib/favorites";
import { useSearch } from "./SearchOverlay";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/api/client";
import { useSite } from "@/lib/siteContent";
import WhatsAppIcon from "./WhatsAppIcon";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.6 3c.3 2.4 1.7 3.9 4 4.1v3c-1.4.1-2.7-.3-4-1.1v6.3c0 3.6-2.5 6.2-5.9 6.2-3.2 0-5.7-2.4-5.7-5.5 0-3.3 2.8-5.8 6.3-5.4v3.2c-1.6-.4-3.1.6-3.1 2.1 0 1.2.9 2.2 2.2 2.2 1.4 0 2.3-.9 2.3-2.5V3h3.9Z" />
    </svg>
  );
}

function TopbarMessages({ messages, linkLabel }: { messages: string[]; linkLabel: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (messages.length < 2 || paused || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 5000);
    return () => clearInterval(t);
  }, [messages.length, paused, reduce]);

  return (
    <p
      className="relative flex h-9 items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          className="flex max-w-full items-center justify-center gap-1.5 truncate"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="truncate">{messages[i % messages.length]}</span>
          {linkLabel.trim() && (
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 shrink-0 items-center font-medium underline underline-offset-2 transition-colors hover:text-white">
              {linkLabel}
            </a>
          )}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}

const links = [
  { to: "/", key: "nav_home", end: true },
  { to: "/catalogue", key: "nav_shop" },
  { to: "/a-propos", key: "nav_about" },
  { to: "/contact", key: "nav_contact" },
];

export default function Navbar() {
  const { general, texts } = useSite();
  const { open: openSearch } = useSearch();
  const favCount = useFavorites().length;
  const socials = [
    { label: "Instagram", href: general.instagram, icon: InstagramIcon },
    { label: "Facebook", href: general.facebook, icon: FacebookIcon },
    { label: "TikTok", href: general.tiktok, icon: TikTokIcon },
  ].filter((x) => x.href);
  const topMessages = [texts.topbar_text, ...texts.topbar_messages.split("\n")].map((m) => m.trim()).filter(Boolean);
  const brandWords = general.brand.trim().split(" ");
  const brandLast = brandWords.length > 1 ? brandWords.pop() : "";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-500",
        scrolled || open
          ? "bg-blush/90 backdrop-blur-md shadow-[0_8px_30px_-18px_rgba(107,23,48,0.4)]"
          : "bg-transparent"
      )}
    >
      {texts.topbar_text.trim() && (
        <div
          className={cn(
            "overflow-hidden bg-wine text-blush transition-[max-height,opacity] duration-300",
            scrolled || open ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          )}
        >
          <div className="mx-auto grid h-9 max-w-[1320px] items-center gap-4 px-5 text-[0.78rem] md:grid-cols-[1fr_auto_1fr] md:px-10 md:text-[0.82rem]">
            <div className="hidden items-center gap-5 md:flex">
              {general.phone && (
                <a href={`tel:${general.phone.replace(/\s/g, "")}`} className="flex min-h-9 items-center gap-1.5 transition-colors hover:text-white">
                  <Phone className="h-3.5 w-3.5" /> {general.phone}
                </a>
              )}
              {general.opening_hours && (
                <span className="flex items-center gap-1.5 text-blush/80">
                  <Clock className="h-3.5 w-3.5" /> {general.opening_hours}
                </span>
              )}
            </div>
            <TopbarMessages messages={topMessages} linkLabel={texts.topbar_link} />
            <ul className="hidden items-center justify-end gap-1 md:flex">
              {socials.map((x) => (
                <li key={x.label}>
                  <a href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} title={x.label} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-blush/15 hover:text-white">
                    <x.icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <nav className={cn("relative mx-auto flex max-w-[1320px] items-center justify-between px-5 transition-[height] duration-300 md:px-10", scrolled ? "h-16" : "h-[72px]")}>
        <Link to="/" onClick={() => setOpen(false)} className="whitespace-nowrap font-brand text-[1.45rem] leading-none text-wine">
          {brandWords.join(" ")} {brandLast && <span className="italic text-rose">{brandLast}</span>}
        </Link>

        <ul className="hidden md:flex items-center gap-9">
          {links.map((l) =>
            l.key === "nav_shop" ? (
              <ShopMenu key={l.to} />
            ) : (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "relative block py-2.5 text-[0.95rem] font-medium transition-colors",
                    isActive ? "text-wine" : "text-ink-soft hover:text-wine"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {texts[l.key]}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 bottom-1.5 h-0.5 rounded-full bg-rose"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            )
          )}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={openSearch}
            aria-label={texts.search_title}
            className="hidden h-11 w-56 items-center gap-2.5 rounded-full bg-white/80 px-4 text-sm text-ink-soft ring-1 ring-blush-edge/80 transition-all hover:bg-white hover:ring-rose xl:flex"
          >
            <Search className="h-4 w-4 text-wine" />
            <span className="flex-1 truncate text-left">{texts.nav_search}…</span>
            <kbd className="rounded-md border border-blush-edge bg-blush px-1.5 py-0.5 font-mono text-[0.7rem]">/</kbd>
          </button>
          <button onClick={openSearch} aria-label={texts.search_title} title={texts.search_title} className="flex h-11 w-11 items-center justify-center rounded-full text-wine transition-colors hover:bg-blush-deep xl:hidden">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/favoris" aria-label={texts.nav_favorites} title={texts.nav_favorites} className="relative hidden h-11 w-11 items-center justify-center rounded-full text-wine transition-colors hover:bg-blush-deep md:flex">
            <Heart className="h-5 w-5" />
            {favCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[0.62rem] font-semibold text-[#fff]">{favCount}</span>}
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="lmd-btn lmd-btn-wine !py-2.5 !px-5 !text-sm max-md:!hidden"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {texts.nav_cta}
          </a>
          <button
            className="md:hidden p-2 -mr-2 text-wine"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden px-5 pb-6 pt-2">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-2xl px-4 py-3.5 font-brand text-2xl",
                      isActive ? "bg-blush-deep text-wine" : "text-ink-soft"
                    )
                  }
                >
                  {texts[l.key]}
                </NavLink>
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="lmd-btn lmd-btn-wine w-full mt-4"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {texts.nav_cta}
          </a>
        </div>
      )}
    </motion.header>
  );
}
