import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { whatsappLink } from "@/api/client";
import { useSite } from "@/lib/siteContent";
import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppButton() {
  useSite();
  const onProductPage = useLocation().pathname.startsWith("/produit/");
  return (
    <motion.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      className={`lmd-btn lmd-btn-wine fixed right-5 z-50 !px-4 sm:!px-6 !py-3.5 ${onProductPage ? "max-md:hidden" : ""}`}
      aria-label="Nous écrire sur WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 14, delay: 2 }}
    >
      <span aria-hidden className="absolute inset-0 rounded-full bg-wine animate-ping opacity-25 [animation-duration:2.8s]" />
      <WhatsAppIcon className="relative h-5 w-5" />
      <span className="relative hidden sm:inline">Nous écrire</span>
    </motion.a>
  );
}
