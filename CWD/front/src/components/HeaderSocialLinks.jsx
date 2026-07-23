"use client";

import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { getSocialLinks } from "@/lib/socialLinks";

const PUBLIC_ROUTES = new Set([
  "/",
  "/quienessomos",
  "/servicios",
  "/contacto",
]);

export default function HeaderSocialLinks() {
  const pathname = usePathname();
  const { language } = useLanguage();

  if (!PUBLIC_ROUTES.has(pathname)) {
    return null;
  }

  const socialLinks = getSocialLinks(language);

  return (
    <div className="header-social-links" aria-label="Social media">
      <a
        href={socialLinks.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="header-social-link"
        aria-label="Instagram"
      >
        <FaInstagram aria-hidden="true" focusable="false" />
      </a>

      <a
        href={socialLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="header-social-link"
        aria-label="Facebook"
      >
        <FaFacebookF aria-hidden="true" focusable="false" />
      </a>

      <a
        href={socialLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="header-social-link"
        aria-label="WhatsApp"
      >
        <FaWhatsapp aria-hidden="true" focusable="false" />
      </a>
    </div>
  );
}
