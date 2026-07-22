"use client";

import { usePathname } from "next/navigation";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { getSocialLinks } from "@/lib/socialLinks";

export default function ContactHeaderSocials() {
  const pathname = usePathname();
  const { language } = useLanguage();

  if (pathname !== "/contacto") {
    return null;
  }

  const socialLinks = getSocialLinks(language);

  return (
    <div className="contact-header-socials">
      <a
        href={socialLinks.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-header-social-link"
        aria-label="Instagram"
      >
        <FaInstagram aria-hidden="true" focusable="false" />
      </a>

      <a
        href={socialLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-header-social-link"
        aria-label="Facebook"
      >
        <FaFacebook aria-hidden="true" focusable="false" />
      </a>

      <a
        href={socialLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-header-social-link"
        aria-label="WhatsApp"
      >
        <FaWhatsapp aria-hidden="true" focusable="false" />
      </a>
    </div>
  );
}
