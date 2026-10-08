import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import { useSite } from "@/lib/siteContent";
import PageHeader from "@/components/public/PageHeader";
import Seo from "@/components/public/Seo";
import Rich from "@/components/public/Rich";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";

export default function ContactPage() {
  const { general, texts } = useSite();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    setSending(true);
    try {
      await api.messages.create({ name, phone, email, message });
      setSent(true);
      setName(""); setPhone(""); setEmail(""); setMessage("");
    } catch {
      setError("Votre message n'est pas parti. Réessayez, ou écrivez-nous directement sur WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  const label = "block mb-2 text-[0.95rem] font-medium text-wine";

  return (
    <div>
      <Seo title="Contact" description={texts.contact_intro} path="/contact" />
      <PageHeader
        title={<Rich text={texts.contact_title} />}
        intro={texts.contact_intro}
      />

      <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-16 md:py-24 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14">
        <div className="rounded-[2rem] bg-gradient-to-br from-wine to-wine-deep p-8 md:p-12 text-blush flex flex-col justify-between">
          <div>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush/12 ring-1 ring-blush/25">
              <WhatsAppIcon className="h-7 w-7 text-blush" />
            </span>
            <h2 className="mt-7 font-brand text-4xl md:text-5xl leading-[1.05]">
              <Rich text={texts.contact_whatsapp_title} accent="italic text-blush-edge" />
            </h2>
            <p className="mt-5 max-w-[34ch] leading-relaxed text-blush/80">
              {texts.contact_whatsapp_text}
            </p>
          </div>
          <ul className="mt-8 space-y-3 text-[0.95rem] text-blush/90">
            {[
              { icon: Phone, text: general.phone },
              { icon: Mail, text: general.email },
              { icon: MapPin, text: general.address },
              { icon: Clock, text: general.opening_hours },
            ]
              .filter((i) => i.text)
              .map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blush-edge" />
                  {text}
                </li>
              ))}
          </ul>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="lmd-btn mt-10 bg-blush text-wine hover:bg-white self-start"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {texts.contact_whatsapp_button}
          </a>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white/70 p-8 md:p-12 space-y-5">
          <h2 className="font-brand text-3xl text-wine">{texts.contact_form_title}</h2>
          <div>
            <label htmlFor="c-name" className={label}>Nom *</label>
            <input id="c-name" className="lmd-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Votre nom" autoComplete="name" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="c-phone" className={label}>Téléphone</label>
              <input id="c-phone" className="lmd-field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+509 ..." autoComplete="tel" />
            </div>
            <div>
              <label htmlFor="c-email" className={label}>Email</label>
              <input id="c-email" className="lmd-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" />
            </div>
          </div>
          <div>
            <label htmlFor="c-msg" className={label}>Message</label>
            <textarea id="c-msg" className="lmd-field min-h-36 resize-y" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Dites-nous ce que vous cherchez" />
          </div>

          {error && <p role="alert" className="rounded-2xl bg-rose/10 px-4 py-3 text-sm text-wine">{error}</p>}
          {sent && <p role="status" className="rounded-2xl bg-wine/8 px-4 py-3 text-sm text-wine">{texts.contact_success}</p>}

          <button type="submit" disabled={sending} className="lmd-btn lmd-btn-wine w-full sm:w-auto disabled:opacity-60 disabled:pointer-events-none">
            <Send className="h-4 w-4" />
            {sending ? "Envoi en cours..." : "Envoyer le message"}
          </button>
        </form>
      </div>
    </div>
  );
}
