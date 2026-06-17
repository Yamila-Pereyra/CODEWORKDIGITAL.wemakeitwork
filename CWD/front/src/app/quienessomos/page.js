"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import OpticalDivider from "@/components/OpticalDivider";

export default function QuienesSomos() {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const qs = t.quienesSomosPage;

  return (
      <main className="qs-page">
        <section className="qs-hero">
          <div className="qs-hero-layout">
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

            <div className="qs-hero-image">
              <img
                  src="/imagenes/quienes-somos-hero.png"
                  alt="Oficina de Code Work Digital"
                  loading="eager"
              />
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
          <div className="qs-valores-grid">
            {qs.valores.map((item, index) => (
                <article className="qs-card" key={index}>
                  <span>{item.numero}</span>

                  <h3>{item.titulo}</h3>

                  <p>{item.texto}</p>
                </article>
            ))}
          </div>
          <OpticalDivider />
        </section>
      </main>
  );
}
