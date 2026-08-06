"use client";

import ContactForm from "@/components/ContactForm";
import OpticalDivider from "@/components/OpticalDivider";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function ContactoPageContent() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const copy = t.contactPage;

  return (
      <main className="contacto-page">
        <section id="contacto" className="contacto-section optical-divider-host">
          <div className="contacto-container">
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
                <ContactForm />
              </div>
            </div>
          </div>
          <OpticalDivider />
        </section>
      </main>
  );
}
