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
import { setCurrency, setPricesVisible } from "@/lib/utils";
import { LOCAL_VIDEOS, type SiteVideo } from "@/data/videos";

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
  options: SiteOptions;
  videos: SiteVideo[];
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

export interface SiteOptions {
  color_wine: string;
  color_rose: string;
  color_blush: string;
  show_preloader: boolean;
  show_reassurance: boolean;
  show_brands: boolean;
  show_categories: boolean;
  show_featured: boolean;
  show_videos: boolean;
  show_about: boolean;
  show_howto: boolean;
  show_faq: boolean;
  show_floating_whatsapp: boolean;
  show_prices: boolean;
  show_install_button: boolean;
  show_visitor_push: boolean;
  show_contact_form: boolean;
  default_sort: "default" | "price-asc" | "price-desc" | "name";
  hide_unavailable: boolean;
  maintenance: boolean;
  maintenance_text: string;
  analytics_id: string;
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
  { key: "topbar_text", group: "Barre du haut", label: "Message de la barre du haut", hint: "Laissez vide pour masquer la barre.", value: "Prix, disponibilité, commande : sur WhatsApp." },
  { key: "topbar_link", group: "Barre du haut", label: "Lien à la suite du message", hint: "Ouvre WhatsApp. Laissez vide pour ne pas l'afficher.", value: "Écrire →" },
  { key: "nav_home", group: "Menu", label: "Menu : accueil", value: "Accueil" },
  { key: "nav_shop", group: "Menu", label: "Menu : boutique", value: "Boutique" },
  { key: "nav_about", group: "Menu", label: "Menu : à propos", value: "À propos" },
  { key: "nav_contact", group: "Menu", label: "Menu : contact", value: "Contact" },
  { key: "nav_cta", group: "Menu", label: "Bouton du menu (WhatsApp)", value: "Nous écrire" },
  { key: "floating_whatsapp_label", group: "Boutons", label: "Bouton WhatsApp flottant", value: "Nous écrire" },
  { key: "card_button", group: "Boutons", label: "Bouton des produits (grand écran)", value: "Demander sur WhatsApp" },
  { key: "card_button_short", group: "Boutons", label: "Bouton des produits (petit écran)", value: "Demander" },
  { key: "footer_nav_title", group: "Pied de page", label: "Titre de la colonne navigation", value: "Navigation" },
  { key: "footer_contact_title", group: "Pied de page", label: "Titre de la colonne contact", value: "Nous joindre" },
  { key: "footer_install", group: "Pied de page", label: "Bouton d'installation de l'application", value: "Installer l'application" },
  { key: "shop_error_title", group: "Boutique", label: "Titre si la boutique ne répond pas", value: "La boutique ne répond pas pour le moment." },
  { key: "shop_error_text", group: "Boutique", label: "Texte si la boutique ne répond pas", long: true, value: "Réessayez dans un instant, ou écrivez-nous directement." },
  { key: "shop_empty_title", group: "Boutique", label: "Titre quand aucun produit ne correspond", value: "Aucun produit ne correspond." },
  { key: "shop_empty_text", group: "Boutique", label: "Texte quand aucun produit ne correspond", long: true, value: "Modifiez votre recherche, ou dites-nous ce que vous cherchez : nous le trouvons pour vous." },
  { key: "shop_reset_button", group: "Boutique", label: "Bouton « tous les produits »", value: "Voir tous les produits" },
  { key: "product_unavailable", group: "Fiche produit", label: "Étiquette produit indisponible", value: "Indisponible" },
  { key: "product_related_title", group: "Fiche produit", label: "Titre des produits similaires", value: "Vous aimerez *aussi*" },
  { key: "product_howto_title", group: "Fiche produit", label: "Titre « Comment commander »", value: "Comment *commander*" },
  { key: "product_not_found", group: "Fiche produit", label: "Message produit introuvable", value: "Ce produit est introuvable." },
  { key: "contact_label_name", group: "Contact", label: "Champ nom", value: "Nom *" },
  { key: "contact_label_phone", group: "Contact", label: "Champ téléphone", value: "Téléphone" },
  { key: "contact_label_email", group: "Contact", label: "Champ email", value: "Email" },
  { key: "contact_label_message", group: "Contact", label: "Champ message", value: "Message" },
  { key: "contact_submit", group: "Contact", label: "Bouton d'envoi", value: "Envoyer le message" },
  { key: "stats_products", group: "Accueil", label: "Légende : nombre de produits", value: "produits en boutique" },
  { key: "stats_categories", group: "Accueil", label: "Légende : nombre d'univers", value: "univers à découvrir" },
  { key: "chat_placeholder", group: "Assistant", label: "Texte dans la zone de message", value: "Écrivez votre question" },
  { key: "order_quantity", group: "Commande", label: "Libellé de la quantité", value: "Quantité" },
  { key: "order_note", group: "Commande", label: "Note sous le bouton d'envoi", long: true, value: "WhatsApp s'ouvre avec ce message, vous pouvez encore le modifier." },
  { key: "footer_credit", group: "Pied de page", label: "Mention de réalisation", value: "Powered by Giovanni Charles E." },
  { key: "back_to_top", group: "Boutons", label: "Bouton « haut de page » (accessibilité)", value: "Revenir en haut" },
  { key: "install_prompt_title", group: "Installation de l'application", label: "Titre de l'invitation", value: "Installez l'application" },
  { key: "install_prompt_text", group: "Installation de l'application", label: "Texte de l'invitation", long: true, value: "Ajoutez LaMaison Dany à votre écran d'accueil : accès direct, ouverture instantanée, même avec une connexion lente." },
  { key: "install_prompt_ios", group: "Installation de l'application", label: "Texte sur iPhone", long: true, value: "Ajoutez LaMaison Dany à votre écran d'accueil pour y accéder en un geste." },
  { key: "install_prompt_ios_hint", group: "Installation de l'application", label: "Consigne sur iPhone", value: "Touchez Partager, puis « Sur l'écran d'accueil »." },
  { key: "install_prompt_button", group: "Installation de l'application", label: "Bouton d'installation", value: "Installer" },
  { key: "install_prompt_later", group: "Installation de l'application", label: "Bouton « plus tard »", value: "Plus tard" },
  { key: "footer_push_button", group: "Pied de page", label: "Bouton d'abonnement aux notifications", value: "Recevoir nos nouveautés" },
  { key: "footer_push_on", group: "Pied de page", label: "Texte quand les notifications sont actives", value: "Notifications activées" },
  { key: "footer_push_off", group: "Pied de page", label: "Lien pour se désabonner", value: "Se désabonner" },
  { key: "footer_push_confirm", group: "Pied de page", label: "Question de confirmation du désabonnement", value: "Ne plus recevoir nos notifications ?" },
  { key: "hero_eyebrow", group: "Accueil : en-tête", label: "Pastille au-dessus du titre", value: "Disponible maintenant sur WhatsApp" },
  { key: "hero_words_prefix", group: "Accueil : en-tête", label: "Début de la phrase qui change", value: "Le choix idéal" },
  { key: "hero_words", group: "Accueil : en-tête", label: "Mots qui défilent (un par ligne)", long: true, value: "pour elle\npour lui\npour offrir\npour vous faire plaisir" },
  { key: "hero_proof", group: "Accueil : en-tête", label: "Points de confiance sous les boutons (un par ligne)", long: true, value: "Réponse rapide sur WhatsApp\nConseil personnalisé\nAucun paiement en ligne" },
  { key: "hero_badge_ring", group: "Accueil : en-tête", label: "Texte qui tourne autour du badge", value: "Sélection premium" },
  { key: "hero_scroll", group: "Accueil : en-tête", label: "Invitation à descendre", value: "Découvrir" },
  { key: "credit_phone", group: "Réalisation du site", label: "Numéro du développeur", value: "676101942" },
  { key: "credit_email", group: "Réalisation du site", label: "Email du développeur", value: "ebodegiovanni@gmail.com" },
  { key: "credit_contact_title", group: "Réalisation du site", label: "Titre de la fenêtre de contact", value: "Un projet de site ou d'application ?" },
  { key: "credit_contact_text", group: "Réalisation du site", label: "Texte de la fenêtre de contact", long: true, value: "Choisissez comment échanger avec Giovanni Charles E. : nous vous redirigeons directement." },
  { key: "credit_message", group: "Réalisation du site", label: "Message prérempli", long: true, value: "Bonjour Giovanni, je vous contacte depuis le site LaMaison Dany." },
  { key: "credit_mail_subject", group: "Réalisation du site", label: "Objet de l'email", value: "Contact depuis le site LaMaison Dany" },
  { key: "credit_choice_whatsapp", group: "Réalisation du site", label: "Libellé : WhatsApp", value: "Écrire sur WhatsApp" },
  { key: "credit_choice_call", group: "Réalisation du site", label: "Libellé : appel", value: "Appeler" },
  { key: "credit_choice_email", group: "Réalisation du site", label: "Libellé : email", value: "Envoyer un email" },
  { key: "credit_close", group: "Réalisation du site", label: "Libellé : fermer", value: "Fermer" },
  { key: "nav_search", group: "Recherche, favoris et filtres", label: "Menu : recherche", value: "Recherche" },
  { key: "nav_favorites", group: "Recherche, favoris et filtres", label: "Menu : favoris", value: "Favoris" },
  { key: "search_title", group: "Recherche, favoris et filtres", label: "Titre de la recherche", value: "Rechercher dans la boutique" },
  { key: "search_recent", group: "Recherche, favoris et filtres", label: "Recherches récentes", value: "Recherches récentes" },
  { key: "search_popular", group: "Recherche, favoris et filtres", label: "Suggestions", value: "Suggestions" },
  { key: "search_clear", group: "Recherche, favoris et filtres", label: "Effacer", value: "Effacer" },
  { key: "search_close", group: "Recherche, favoris et filtres", label: "Fermer la recherche", value: "Fermer la recherche" },
  { key: "search_results", group: "Recherche, favoris et filtres", label: "Libellé produit", value: "Produit" },
  { key: "search_categories", group: "Recherche, favoris et filtres", label: "Libellé catégorie", value: "Catégorie" },
  { key: "search_all", group: "Recherche, favoris et filtres", label: "Voir tous les résultats", value: "Voir tous les résultats" },
  { key: "search_tip", group: "Recherche, favoris et filtres", label: "Astuce", long: true, value: "Astuce : appuyez sur / ou Ctrl K pour rechercher depuis n'importe quelle page." },
  { key: "search_empty_title", group: "Recherche, favoris et filtres", label: "Titre sans résultat ({q} = recherche)", value: "Aucun résultat pour « {q} »" },
  { key: "search_empty_text", group: "Recherche, favoris et filtres", label: "Texte sans résultat", long: true, value: "Essayez un autre mot, ou dites-nous ce que vous cherchez : nous le trouvons pour vous." },
  { key: "search_empty_cta", group: "Recherche, favoris et filtres", label: "Bouton sans résultat", value: "Demander sur WhatsApp" },
  { key: "fav_add", group: "Recherche, favoris et filtres", label: "Ajouter aux favoris", value: "Ajouter aux favoris" },
  { key: "fav_remove", group: "Recherche, favoris et filtres", label: "Retirer des favoris", value: "Retirer des favoris" },
  { key: "fav_title", group: "Recherche, favoris et filtres", label: "Titre de la page favoris", value: "Mes *favoris*" },
  { key: "fav_intro", group: "Recherche, favoris et filtres", label: "Introduction de la page favoris", long: true, value: "Gardez ici les produits qui vous plaisent, puis envoyez votre sélection d'un seul message sur WhatsApp." },
  { key: "fav_empty_title", group: "Recherche, favoris et filtres", label: "Titre favoris vides", value: "Aucun favori pour le moment" },
  { key: "fav_empty_text", group: "Recherche, favoris et filtres", label: "Texte favoris vides", long: true, value: "Touchez le cœur d'un produit pour le retrouver ici." },
  { key: "fav_empty_cta", group: "Recherche, favoris et filtres", label: "Bouton favoris vides", value: "Découvrir la boutique" },
  { key: "fav_send", group: "Recherche, favoris et filtres", label: "Bouton d'envoi des favoris", value: "Envoyer ma sélection sur WhatsApp" },
  { key: "fav_clear", group: "Recherche, favoris et filtres", label: "Bouton vider les favoris", value: "Vider ma sélection" },
  { key: "fav_clear_confirm", group: "Recherche, favoris et filtres", label: "Confirmation vider les favoris", value: "Retirer tous les produits de vos favoris ?" },
  { key: "fav_message", group: "Recherche, favoris et filtres", label: "Début du message WhatsApp des favoris", long: true, value: "Bonjour LaMaison Dany, voici les produits qui m'intéressent :" },
  { key: "recent_title", group: "Recherche, favoris et filtres", label: "Titre « vus récemment »", value: "Vus *récemment*" },
  { key: "filter_available", group: "Recherche, favoris et filtres", label: "Filtre disponibilité", value: "Disponibles uniquement" },
  { key: "filter_reset", group: "Recherche, favoris et filtres", label: "Réinitialiser les filtres", value: "Réinitialiser les filtres" },
  { key: "topbar_messages", group: "Barre du haut", label: "Messages supplémentaires (un par ligne)", hint: "Ils défilent avec le message principal. Laissez vide pour n'en afficher qu'un.", long: true, value: "Réponse rapide, du lundi au samedi\nConseils personnalisés pour chaque produit\nPaiement et livraison réglés directement avec vous" },
  { key: "nav_shop_menu_title", group: "Barre du haut", label: "Titre du menu Boutique", value: "Nos univers" },
  { key: "nav_shop_all", group: "Barre du haut", label: "Bouton du menu Boutique", value: "Voir toute la boutique" },
  { key: "nav_shop_featured", group: "Barre du haut", label: "Titre des coups de cœur du menu", value: "Coups de cœur" },
  { key: "loader_tagline", group: "Écran de chargement", label: "Phrase sous le nom", value: "Parfums, cosmétiques, vins & plus" },
  { key: "brands_list", group: "Accueil", label: "Marques affichées en défilement", hint: "Séparées par des virgules. Laissez vide pour masquer la bande.", long: true, value: "J.P. Chenet, Jean Paul Gaultier, Mauboussin, Diana Castel, Jacques Saint Pres, Mixa, Le Petit Marseillais, Cadum, Yves Rocher, Byphasse, Lacura, Femfresh, Brut, Carré Homme" },
  { key: "videos_title", group: "Accueil", label: "Titre de la section vidéos", value: "Nos produits *en vidéo*" },
  { key: "videos_text", group: "Accueil", label: "Texte de la section vidéos", long: true, value: "Découvrez nos produits de plus près, puis écrivez-nous sur WhatsApp." },
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
  videos: LOCAL_VIDEOS,
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
  options: {
    color_wine: "",
    color_rose: "",
    color_blush: "",
    show_preloader: true,
    show_reassurance: true,
    show_brands: true,
    show_categories: true,
    show_featured: true,
    show_videos: true,
    show_about: true,
    show_howto: true,
    show_faq: true,
    show_floating_whatsapp: true,
    show_prices: true,
    show_install_button: true,
    show_visitor_push: true,
    show_contact_form: true,
    default_sort: "default",
    hide_unavailable: false,
    maintenance: false,
    maintenance_text: "Le site est en cours de mise à jour. Écrivez-nous sur WhatsApp, nous répondons à toutes vos demandes.",
    analytics_id: "",
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

const HEX = /^#[0-9a-fA-F]{6}$/;

function useSiteEffects(o: SiteOptions) {
  useEffect(() => {
    let el = document.getElementById("lmd-theme") as HTMLStyleElement | null;
    const vars: string[] = [];
    if (HEX.test(o.color_wine)) vars.push(`--color-wine:${o.color_wine}`, `--color-wine-deep:color-mix(in srgb, ${o.color_wine} 68%, black)`);
    if (HEX.test(o.color_rose)) vars.push(`--color-rose:${o.color_rose}`);
    if (HEX.test(o.color_blush)) vars.push(`--color-blush:${o.color_blush}`, `--color-blush-deep:color-mix(in srgb, ${o.color_blush} 92%, #b23a5b)`, `--color-blush-edge:color-mix(in srgb, ${o.color_blush} 80%, #b23a5b)`);
    if (!vars.length) {
      el?.remove();
    } else {
      if (!el) {
        el = document.createElement("style");
        el.id = "lmd-theme";
        document.head.appendChild(el);
      }
      el.textContent = `:root:not(.lmd-dark){${vars.join(";")}}`;
    }
    try {
      localStorage.setItem("lmd_no_intro", o.show_preloader ? "0" : "1");
    } catch {
      /* stockage indisponible */
    }
  }, [o.color_wine, o.color_rose, o.color_blush, o.show_preloader]);

  useEffect(() => {
    const id = o.analytics_id.trim();
    if (!import.meta.env.PROD || !/^G-[A-Z0-9]{4,}$/.test(id) || document.getElementById("lmd-ga")) return;
    const s = document.createElement("script");
    s.id = "lmd-ga";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
    const w = window as unknown as { dataLayer: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(["js", new Date()], ["config", id]);
  }, [o.analytics_id]);
}

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
  setPricesVisible(content.options.show_prices);
  useSiteEffects(content.options);

  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
