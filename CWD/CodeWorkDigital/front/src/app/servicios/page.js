import "@/styles/servicios.css";
import Link from "next/link";
import { FaLaptopCode, FaShoppingCart, FaChartLine } from "react-icons/fa";

export const metadata = {
  title: "Code Work Digital - Servicios",
  description: "Soluciones web que impulsan tu negocio",
};

export default function Servicios() {
  return (
    <main>
      {/* HERO */}
      <section className="hero-section">
        <div className="container">
          <h2>Creamos sitios web profesionales que impulsan tu negocio</h2>
          <p className="subtitulo">
            En <strong>CodeWork Digital</strong> desarrollamos páginas web modernas, seguras y optimizadas
            para que tu marca tenga presencia profesional y atraiga más clientes.
          </p>

          <div className="hero-buttons">
            <Link href="/contacto" className="btn-primary">
              Solicitar presupuesto
            </Link>
            <Link href="/novedades" className="btn-outline">
              Ver portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="servicios">
        <div className="container">
          <h2 className="titulo-servicios">Servicios</h2>

          <div className="cards-wrapper">
            <div className="service-card">
              <FaLaptopCode className="card-icon" />
              <h3>Desarrollo Web Profesional</h3>
              <p>Sitios institucionales, landing pages y portfolios con diseño moderno y experiencia clara.</p>
            </div>

            <div className="service-card">
              <FaShoppingCart className="card-icon" />
              <h3>Tiendas Online</h3>
              <p>E-commerce con WooCommerce o Shopify, integración de pagos y diseño totalmente responsive.</p>
            </div>

            <div className="service-card">
              <FaChartLine className="card-icon" />
              <h3>Optimización & SEO Básico</h3>
              <p>Mejoras de velocidad, rendimiento y estructura para aumentar visibilidad y conversiones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="container">
          <h2>¿Listo para dar el siguiente paso?</h2>
          <p>Escribinos y empezamos tu proyecto hoy mismo.</p>
          <Link href="/contacto" className="btn-primary btn-contactar">
            Contactar ahora
          </Link>
        </div>
      </section>
    </main>
  );
}
