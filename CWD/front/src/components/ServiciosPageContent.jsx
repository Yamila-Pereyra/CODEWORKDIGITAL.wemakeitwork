"use client";

import Link from "next/link";
import {
  FaLaptopCode,
  FaShoppingCart,
  FaChartLine,
  FaChartPie,
  FaMobileAlt,
} from "react-icons/fa";
import OpticalDivider from "@/components/OpticalDivider";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

const serviceIcons = [
  FaLaptopCode,
  FaShoppingCart,
  FaMobileAlt,
  FaChartLine,
  FaChartPie,
];

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

            <div className="servicios-actions">
              <Link href="/contacto" className="servicios-btn-primary">
                {copy.hero.cta}
              </Link>
            </div>
          </div>
        </section>

        <section className="servicios-lista">
          <div className="servicios-container">
            <div className="servicios-heading">
              <span className="servicios-label">{copy.list.label}</span>

              <h2>{copy.list.title}</h2>
            </div>

            <div className="servicios-grid">
              {copy.list.items.map((item, index) => {
                const Icon = serviceIcons[index] || FaChartLine;

                return (
                    <article className="servicio-card" key={item.numero}>
                      <Icon className="servicio-icon" />

                      <span>{item.numero}</span>

                      <h3>{item.titulo}</h3>

                      <p>{item.texto}</p>
                    </article>
                );
              })}
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
