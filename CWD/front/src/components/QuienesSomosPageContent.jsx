"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import OpticalDivider from "@/components/OpticalDivider";
import QuienesSomosValuesSequence from "@/components/QuienesSomosValuesSequence";

const GlobeLab = dynamic(() => import("@/components/labs/globe/GlobeLab"), {
  ssr: false,
});

export default function QuienesSomosPageContent() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const qs = t.quienesSomosPage;

  return (
    <main className="qs-page">
      <section className="qs-hero">
        <div className="qs-hero-layout">
          <div className="qs-hero-globe-layer" aria-hidden="true">
            <GlobeLab
              wrapper="div"
              className="qs-hero-globe"
              stageClassName="qs-hero-globe__stage"
              ariaLabel="Globo internacional de Code Work Digital"
              progressiveReveal
            />
          </div>

          <div className="qs-hero-content">
            <span className="qs-label">{qs.label}</span>

            <h1>{qs.titulo}</h1>

            <p>{qs.descripcion}</p>

            <div className="qs-actions">
              <a href="/contacto" className="qs-btn-primary">
                {qs.botonProyecto}
              </a>

              <a href="/servicios" className="qs-btn-secondary">
                {qs.botonServicios}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="qs-manifiesto">
        <div className="qs-manifiesto-grid">
          <p>{qs.manifiestoTexto}</p>

          <div>
            <span className="qs-label">{qs.manifiestoLabel}</span>

            <h2>{qs.manifiestoTitulo}</h2>
          </div>
        </div>
      </section>

      <section className="qs-valores optical-divider-host">
        <QuienesSomosValuesSequence items={qs.valores} />
        <OpticalDivider />
      </section>
    </main>
  );
}
