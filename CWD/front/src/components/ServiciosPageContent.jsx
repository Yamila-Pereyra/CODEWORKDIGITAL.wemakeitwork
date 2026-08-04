"use client";

import Link from "next/link";
import OpticalDivider from "@/components/OpticalDivider";
import ServicesCardsSequence from "@/components/ServicesCardsSequence";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function ServiciosPageContent() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const copy = t.serviciosPage;

  return (
      <main className="servicios-page">
        <section className="servicios-hero">
          <div className="servicios-container">
            <span className="servicios-label">{copy.hero.label}</span>

            <h1>{copy.hero.title}</h1>

            <p>{copy.hero.text}</p>
          </div>
        </section>

        <section className="servicios-lista">
          <div className="servicios-container">
            <div className="servicios-heading">
              <span className="servicios-label">{copy.list.label}</span>

              <h2>{copy.list.title}</h2>
            </div>

            <ServicesCardsSequence
              items={copy.list.items}
            />
          </div>
        </section>

        <section
          className="servicios-editorial"
          aria-labelledby="servicios-editorial-title"
        >
          <div className="servicios-container">
            <div className="servicios-editorial-grid">
              <div className="servicios-editorial-intro">
                <span className="servicios-label">{copy.editorial.eyebrow}</span>

                <h2 id="servicios-editorial-title">{copy.editorial.title}</h2>
              </div>

              <div className="servicios-editorial-copy">
                <p>{copy.editorial.intro}</p>

                <p className="servicios-editorial-contrast">{copy.editorial.contrast}</p>

                <p>{copy.editorial.analysis}</p>

                <p>{copy.editorial.sizing}</p>

                <p>{copy.editorial.complexity}</p>

                <p className="servicios-editorial-closing">{copy.editorial.closing}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="servicios-cta optical-divider-host">
          <div className="servicios-container">
            <h2>{copy.cta.title}</h2>

            <p>{copy.cta.text}</p>

            <Link href="/contacto" className="servicios-btn-primary">
              {copy.cta.button}
            </Link>
          </div>
          <OpticalDivider />
        </section>
      </main>
  );
}
