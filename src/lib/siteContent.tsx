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
import { api, configureWhatsApp, DEFAULT_PRODUCT_TEMPLATE } from "@/api/client";
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
    product_message: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    opening_hours: string;
  };
  texts: Record<string, string>;
  seo: { title: string; description: string; og_image_url: string };
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

export interface TextField {
  key: string;
  group: string;
  label: string;
  hint?: string;
  long?: boolean;
  value: string;
}

export const TEXT_FIELDS: TextField[] = [
  { key: "loader_tagline", group: "Écran de chargement", label: "Phrase sous le nom", value: "Parfums, cosmétiques, vins & plus" },
  { key: "home_categories_title", group: "Accueil", label: "Titre des catégories", value: "Choisissez votre *univers*" },
  { key: "home_featured_title", group: "Accueil", label: "Titre des coups de cœur", value: "Nos coups de *cœur*" },
  { key: "home_featured_button", group: "Accueil", label: "Bouton vers la boutique", value: "Toute la boutique" },
  { key: "home_featured_empty_title", group: "Accueil", label: "Message s'il n'y a pas encore de coups de cœur", value: "La sélection arrive bientôt." },
  { key: "home_featured_empty_text", group: "Accueil", label: "Texte du message ci-dessus", long: true, value: "En attendant, écrivez-nous : nous vous conseillons sur WhatsApp." },
  { key: "home_howto_title", group: "Accueil", label: "Titre « Comment commander »", value: "Commander, *c'est simple*" },
  { key: "home_faq_title", group: "Accueil", label: "Titre de la FAQ", value: "Vos\n*questions*" },
  { key: "home_faq_text", group: "Accueil", label: "Texte sous la FAQ", long: true, value: "Une autre question ? Notre assistant ou WhatsApp vous répondent." },
  { key: "shop_title", group: "Boutique", label: "Titre de la page", value: "La *boutique*" },
  { key: "shop_intro", group: "Boutique", label: "Introduction", long: true, value: "Parfums, cosmétiques, vins et plus encore. Un produit vous plaît ? Un clic, et la conversation WhatsApp s'ouvre." },
  { key: "shop_search_placeholder", group: "Boutique", label: "Texte dans la recherche", value: "Rechercher : Mixa, parfum, vin rouge…" },
  { key: "about_title", group: "À propos", label: "Titre de la page", hint: "{brand} est remplacé par le nom de la maison.", value: "À propos de *{brand}*" },
  { key: "about_story_title", group: "À propos", label: "Titre de l'histoire", value: "Notre *histoire*" },
  { key: "about_faq_title", group: "À propos", label: "Titre de la FAQ", value: "Questions *fréquentes*" },
  { key: "about_shop_button", group: "À propos", label: "Bouton vers la boutique", value: "Voir la boutique" },
  { key: "contact_title", group: "Contact", label: "Titre de la page", value: "Écrivez-*nous.*" },
  { key: "contact_intro", group: "Contact", label: "Introduction", long: true, value: "Une question, un conseil, une commande ? Le plus simple : WhatsApp. Sinon, laissez-nous un message." },
  { key: "contact_whatsapp_title", group: "Contact", label: "Titre du bloc WhatsApp", value: "Le plus rapide,\n*c'est WhatsApp.*" },
  { key: "contact_whatsapp_text", group: "Contact", label: "Texte du bloc WhatsApp", long: true, value: "Conseil sur un produit, disponibilité, commande : écrivez-nous, la conversation s'ouvre directement." },
  { key: "contact_whatsapp_button", group: "Contact", label: "Bouton WhatsApp", value: "Discuter sur WhatsApp" },
  { key: "contact_form_title", group: "Contact", label: "Titre du formulaire", value: "Ou laissez un message" },
  { key: "contact_success", group: "Contact", label: "Message après envoi", long: true, value: "Merci, votre message est bien envoyé. Nous vous répondons très vite." },
  { key: "footer_text", group: "Pied de page", label: "Texte « Nous joindre » (sans coordonnées)", long: true, value: "Choisissez un produit, écrivez-nous sur WhatsApp : nous vous répondons et organisons la suite avec vous." },
  { key: "footer_cta", group: "Pied de page", label: "Bouton WhatsApp", value: "Commander sur WhatsApp" },
];

export const DEFAULT_TEXTS: Record<string, string> = Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, f.value.split("\\n").join("\n")]));

export const DEFAULT_CONTENT: SiteContent = {
  texts: DEFAULT_TEXTS,
  general: {
    brand: "LaMaison Dany",
    currency: "FCFA",
    tagline: "Parfums, cosmétiques, vins & plus",
    whatsapp_number: import.meta.env.VITE_WHATSAPP_NUMBER || "",
    whatsapp_message:
      import.meta.env.VITE_WHATSAPP_DEFAULT_MESSAGE || "Bonjour LaMaison Dany, je souhaite avoir des informations.",
    product_message: DEFAULT_PRODUCT_TEMPLATE,
    email: "",
    phone: "",
    address: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    opening_hours: "",
  },
  seo: {
    title: "LaMaison Dany : parfums, cosmétiques, vins et plus encore",
    description:
      "Parfums, cosmétiques, vins et bien plus. Choisissez un produit, écrivez-nous sur WhatsApp : nous nous occupons du reste.",
    og_image_url: "",
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

  // Synchronous on purpose: children rendered with this content must already read the fresh values.
  configureWhatsApp(content.general.whatsapp_number, content.general.whatsapp_message, content.general.product_message);
  setCurrency(content.general.currency);

  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
