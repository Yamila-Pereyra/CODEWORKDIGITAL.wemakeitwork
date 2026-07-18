"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSocialLinks } from "@/lib/socialLinks";
import { translations } from "@/translations";

export default function ContactWhatsAppLink() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const socialLinks = getSocialLinks(language);

  return (
    <a
      href={socialLinks.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
    >
      <FaWhatsapp
        className="whatsapp-icon"
        aria-hidden="true"
        focusable="false"
      />
      {t.contactPage.whatsappCta}
    </a>
  );
}
