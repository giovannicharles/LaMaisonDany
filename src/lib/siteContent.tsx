import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Clock,
  Gift,
  HeartHandshake,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { api, configureWhatsApp } from "@/api/client";
import { setCurrency } from "@/lib/utils";

export interface ChatReply {
  label: string;
  answer: string;
}

export interface SiteContent {
  general: {
    brand: string;
    currency: string;
    tagline: string;
    whatsapp_number: string;
    whatsapp_message: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    opening_hours: string;
  };
  hero: {
    line1: string;
    line2: string;
    accent: string;
    text: string;
    cta_primary: string;
    cta_secondary: string;
    badge_title: string;
    badge_text: string;
    image_url: string;
  };
  reassurance: { icon: string; title: string; text: string }[];
  about_home: { line1: string; line2: string; accent: string; text: string; cta: string };
  banner: { line1: string; accent: string; text: string; cta: string };
  how_to_order: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  values: { title: string; desc: string }[];
  order_dialog: { intro: string; quick_messages: string[] };
  chatbot: {
    enabled: boolean;
    name: string;
    welcome: string;
    fallback: string;
    quick_replies: ChatReply[];
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  general: {
    brand: "LaMaison Dany",
    currency: "FCFA",
    tagline: "Parfums, cosmétiques, vins & plus",
    whatsapp_number: import.meta.env.VITE_WHATSAPP_NUMBER || "",
    whatsapp_message:
      import.meta.env.VITE_WHATSAPP_DEFAULT_MESSAGE || "Bonjour LaMaison Dany, je souhaite avoir des informations.",
    email: "",
    phone: "",
    address: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    opening_hours: "",
  },
  hero: {
    line1: "Parfums, cosmétiques,",
    line2: "vins et",
    accent: "plus encore.",
    text: "Une sélection premium pour vous et vos proches. Choisissez un produit, écrivez-nous sur WhatsApp : nous nous occupons du reste.",
    cta_primary: "Commander sur WhatsApp",
    cta_secondary: "Voir la boutique",
    badge_title: "Nouveau",
    badge_text: "en boutique",
    image_url: "",
  },
  reassurance: [
    { icon: "sparkles", title: "Sélection premium", text: "Des produits choisis un à un" },
    { icon: "message", title: "Conseil sur mesure", text: "Un échange direct sur WhatsApp" },
    { icon: "tag", title: "Prix indicatifs", text: "Affichés sur chaque produit" },
    { icon: "handshake", title: "Accompagnement", text: "Du choix jusqu'à votre commande" },
  ],
  about_home: {
    line1: "Une maison née",
    line2: "de la passion",
    accent: "du beau.",
    text: "LaMaison Dany rassemble des parfums, des cosmétiques, des vins et bien d'autres belles choses. Ici, pas de panier ni de formulaire interminable : vous choisissez, vous nous écrivez, nous nous occupons du reste.",
    cta: "Découvrir la maison",
  },
  banner: {
    line1: "Un message,",
    accent: "et votre choix est fait.",
    text: "Dites-nous ce que vous cherchez : nous vous guidons vers le produit qui vous correspond.",
    cta: "Commander sur WhatsApp",
  },
  how_to_order: [
    { title: "Choisissez", text: "Parcourez la boutique et repérez le produit qui vous plaît." },
    { title: "Écrivez-nous", text: "Un clic ouvre WhatsApp avec votre message déjà prêt. Vous pouvez le modifier." },
    { title: "Recevez", text: "Nous confirmons la disponibilité, le prix et la remise avec vous." },
  ],
  faq: [
    {
      q: "Comment passer commande ?",
      a: "Cliquez sur « Demander sur WhatsApp » depuis un produit. Votre message est prérempli, vous pouvez l'ajuster avant l'envoi. Nous vous répondons pour confirmer la disponibilité et organiser la suite.",
    },
    {
      q: "Les prix affichés sont-ils définitifs ?",
      a: "Les prix sont indicatifs. Le prix final et la disponibilité sont confirmés avec vous sur WhatsApp avant toute commande.",
    },
    {
      q: "Quels types de produits proposez-vous ?",
      a: "Des parfums, des cosmétiques, des vins et d'autres produits. Retrouvez-les par catégorie dans la boutique.",
    },
    {
      q: "Y a-t-il un paiement en ligne ?",
      a: "Non. Tout se passe par conversation WhatsApp : vous échangez directement avec nous.",
    },
  ],
  values: [
    { title: "Qualité", desc: "Des produits soigneusement sélectionnés pour leur excellence." },
    { title: "Singularité", desc: "Des choix qui vous ressemblent, pour vous ou pour offrir." },
    { title: "Proximité", desc: "Un accompagnement personnalisé à chaque étape." },
  ],
  order_dialog: {
    intro: "Votre message est prêt. Modifiez-le si vous le souhaitez, puis envoyez-le sur WhatsApp.",
    quick_messages: [
      "Est-il disponible ?",
      "Pouvez-vous me confirmer le prix final ?",
      "Livrez-vous dans ma zone ?",
      "Je souhaite passer commande.",
    ],
  },
  chatbot: {
    enabled: true,
    name: "Assistant LaMaison Dany",
    welcome: "Bonjour et bienvenue chez LaMaison Dany. Comment puis-je vous aider ?",
    fallback:
      "Je n'ai pas la réponse exacte à cette question. Notre équipe vous répond directement sur WhatsApp.",
    quick_replies: [
      {
        label: "Comment commander ?",
        answer:
          "Choisissez un produit, cliquez sur « Demander sur WhatsApp » : votre message est prérempli et modifiable. Nous confirmons ensuite la disponibilité avec vous.",
      },
      {
        label: "Quels produits proposez-vous ?",
        answer: "Parfums, cosmétiques, vins et d'autres produits. Dites-moi ce que vous cherchez et je vous montre ce qui existe.",
      },
      {
        label: "Livraison et paiement",
        answer: "Ces détails sont confirmés avec vous sur WhatsApp, selon votre produit et votre zone.",
      },
    ],
  },
};

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  message: MessageCircleHeart,
  tag: Tag,
  handshake: HeartHandshake,
  truck: Truck,
  shield: ShieldCheck,
  gift: Gift,
  clock: Clock,
  star: Star,
};

export const ICON_OPTIONS = Object.keys(ICONS);

export function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? Sparkles;
}

export function mergeContent(remote: Record<string, unknown>): SiteContent {
  const out = structuredClone(DEFAULT_CONTENT) as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(remote)) {
    if (!(key in out) || value == null) continue;
    const base = out[key];
    if (Array.isArray(base)) {
      if (Array.isArray(value) && value.length > 0) out[key] = value;
    } else if (typeof base === "object" && typeof value === "object") {
      const next: Record<string, unknown> = { ...(base as object) };
      for (const [k, v] of Object.entries(value as object)) {
        if (typeof v === "string" && v.trim() === "" && typeof next[k] === "string" && (next[k] as string) !== "") {
          continue;
        }
        next[k] = v;
      }
      out[key] = next;
    }
  }
  return out as unknown as SiteContent;
}

const SiteContext = createContext<SiteContent>(DEFAULT_CONTENT);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<Record<string, unknown>>({});

  useEffect(() => {
    let alive = true;
    api.settings
      .get()
      .then((res) => alive && setRemote(res.data ?? {}))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const content = useMemo(() => mergeContent(remote), [remote]);

  useEffect(() => {
    configureWhatsApp(content.general.whatsapp_number, content.general.whatsapp_message);
  }, [content.general.whatsapp_number, content.general.whatsapp_message]);

  setCurrency(content.general.currency);

  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
