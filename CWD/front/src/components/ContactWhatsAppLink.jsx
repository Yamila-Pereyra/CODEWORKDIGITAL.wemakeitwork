"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function ContactWhatsAppLink() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;

  return (
    <a
      href="https://wa.me/393393309228"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
    >
      <FaWhatsapp className="whatsapp-icon" />
      {t.contactPage.whatsappCta}
    </a>
  );
}
