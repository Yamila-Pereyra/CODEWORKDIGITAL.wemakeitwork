"use client";

import ContactForm from "@/components/ContactForm";
import ContactWhatsAppLink from "@/components/ContactWhatsAppLink";
import OpticalDivider from "@/components/OpticalDivider";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSocialLinks } from "@/lib/socialLinks";
import { translations } from "@/translations";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";

export default function ContactoPageContent() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const copy = t.contactPage;
  const socialLinks = getSocialLinks(language);

  return (
      <main className="contacto-page">
        <section id="contacto" className="contacto-section optical-divider-host">
          <div className="contacto-container">
            <div className="contacto-top-social">
              <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Instagram"
              >
                <FaInstagram aria-hidden="true" focusable="false" />
              </a>

              <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Facebook"
              >
                <FaFacebook aria-hidden="true" focusable="false" />
              </a>

              <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="WhatsApp"
              >
                <FaWhatsapp aria-hidden="true" focusable="false" />
              </a>
            </div>

            <div className="contacto-header">
              <span className="contacto-label">{copy.hero.label}</span>

              <h1>{copy.hero.title}</h1>

              <p>{copy.hero.text}</p>
            </div>

            <div className="contacto-layout">
              <div className="contacto-info">
                <h2>{copy.info.title}</h2>

                <p>{copy.info.text}</p>

                <ul>
                  {copy.info.items.map((item) => (
                      <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="contacto-form-card">
                <ContactForm
                    postUr={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contacto`}
                />

                <div className="whatsapp-contacto">
                  <ContactWhatsAppLink />
                </div>
              </div>
            </div>
          </div>
          <OpticalDivider />
        </section>
      </main>
  );
}
