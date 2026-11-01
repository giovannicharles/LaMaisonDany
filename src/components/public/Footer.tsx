import { Link } from "react-router-dom";
import { Clock, Download, Mail, MapPin, Phone } from "lucide-react";
import { whatsappLink } from "@/api/client";
import { useSite } from "@/lib/siteContent";
import { usePwaInstall } from "@/lib/pwa";
import WhatsAppIcon from "./WhatsAppIcon";
import { Rings, Sparkle } from "@/components/art/Ornaments";

export default function Footer() {
  const { general, texts, options } = useSite();
  const pwa = usePwaInstall();
  const socials = [
    { label: "Instagram", href: general.instagram },
    { label: "Facebook", href: general.facebook },
    { label: "TikTok", href: general.tiktok },
  ].filter((s) => s.href);

  const infos = [
    { icon: Phone, text: general.phone, href: general.phone ? `tel:${general.phone.replace(/\s/g, "")}` : "" },
    { icon: Mail, text: general.email, href: general.email ? `mailto:${general.email}` : "" },
    { icon: MapPin, text: general.address, href: "" },
    { icon: Clock, text: general.opening_hours, href: "" },
  ].filter((i) => i.text);

  return (
    <footer className="relative isolate overflow-hidden bg-wine-deep text-blush">
      <Rings className="lmd-spin -right-48 -top-48 h-[560px] w-[560px] text-blush/10" />
      <Sparkle className="lmd-float right-[18%] top-16 h-5 w-5 text-blush/30" />
      <div className="max-w-[1320px] mx-auto px-5 md:px-10 pt-20 pb-10">
        <div className="grid gap-14 md:grid-cols-[1.3fr_0.7fr_1fr]">
          <div>
            <p className="font-brand text-4xl md:text-5xl leading-[1.05]">
              {general.brand}
              <br />
              <span className="italic text-blush-edge text-[0.6em]">{general.tagline}</span>
            </p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="lmd-btn mt-8 bg-blush text-wine hover:bg-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {texts.footer_cta}
            </a>
            {pwa.canInstall && options.show_install_button && (
              <button
                onClick={pwa.install}
                className="mt-3 flex items-center gap-2 rounded-full border border-blush/30 px-5 py-2.5 text-[0.95rem] font-medium text-blush transition-colors hover:bg-blush hover:text-wine"
              >
                <Download className="h-4 w-4" /> {texts.footer_install}
              </button>
            )}
            {pwa.showIosHint && (
              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-blush/70">
                Sur iPhone : touchez <strong className="text-blush">Partager</strong>, puis « Sur l'écran d'accueil » pour installer l'application.
              </p>
            )}
          </div>

          <div>
            <h3 className="!font-text !text-sm !font-medium text-blush-edge mb-5">{texts.footer_nav_title}</h3>
            <ul className="space-y-3 text-[0.95rem]">
              <li><Link to="/" className="inline-block py-1.5 hover:text-white transition-colors">{texts.nav_home}</Link></li>
              <li><Link to="/catalogue" className="inline-block py-1.5 hover:text-white transition-colors">{texts.nav_shop}</Link></li>
              <li><Link to="/a-propos" className="inline-block py-1.5 hover:text-white transition-colors">{texts.nav_about}</Link></li>
              <li><Link to="/contact" className="inline-block py-1.5 hover:text-white transition-colors">{texts.nav_contact}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="!font-text !text-sm !font-medium text-blush-edge mb-5">{texts.footer_contact_title}</h3>
            {infos.length > 0 ? (
              <ul className="space-y-3 text-[0.95rem]">
                {infos.map(({ icon: Icon, text, href }) => (
                  <li key={text} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blush-edge" />
                    {href ? <a href={href} className="inline-block py-1.5 hover:text-white transition-colors">{text}</a> : <span>{text}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.95rem] leading-relaxed text-blush/80 max-w-[28ch]">
                {texts.footer_text}
              </p>
            )}
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-blush/25 px-4 py-1.5 text-sm hover:bg-blush hover:text-wine transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-16 pt-6 pb-16 sm:pb-14 border-t border-blush/15 flex flex-col sm:flex-row justify-between gap-2 text-sm text-blush/60">
          <span>© {new Date().getFullYear()} {general.brand} · {general.tagline}</span>
          {texts.footer_credit.trim() && <span className="font-medium text-blush/80">{texts.footer_credit}</span>}
        </div>
      </div>
    </footer>
  );
}
