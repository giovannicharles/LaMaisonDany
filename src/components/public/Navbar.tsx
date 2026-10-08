import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/api/client";
import { useSite } from "@/lib/siteContent";
import WhatsAppIcon from "./WhatsAppIcon";

const links = [
  { to: "/", label: "Accueil", end: true },
  { to: "/catalogue", label: "Boutique" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { general } = useSite();
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
      <nav className="max-w-[1320px] mx-auto px-5 md:px-10 h-[72px] flex items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)} className="font-brand text-[1.45rem] leading-none text-wine">
          {brandWords.join(" ")} {brandLast && <span className="italic text-rose">{brandLast}</span>}
        </Link>

        <ul className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "relative text-[0.95rem] font-medium transition-colors pb-1 block",
                    isActive ? "text-wine" : "text-ink-soft hover:text-wine"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-rose"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="lmd-btn lmd-btn-wine !py-2.5 !px-5 !text-sm hidden sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Nous écrire
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
                  {l.label}
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
            Nous écrire sur WhatsApp
          </a>
        </div>
      )}
    </motion.header>
  );
}
