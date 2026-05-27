import Link from "next/link";
import {
  FaLaptopCode,
  FaShoppingCart,
  FaChartLine,
  FaMobileAlt,
} from "react-icons/fa";

export const metadata = {
  title: "Code Work Digital - Servicios",
  description:
      "Desarrollo web, aplicaciones, e-commerce y soluciones digitales para empresas y emprendedores",
};

export default function Servicios() {
  return (
      <main className="servicios-page">
        {/* HERO */}

        <section className="servicios-hero">
          <div className="servicios-container">
          <span className="servicios-label">
            Soluciones digitales
          </span>

            <h1>
              Sitios web, aplicaciones y herramientas digitales
              diseñadas para impulsar tu negocio.
            </h1>

            <p>
              En Code Work Digital combinamos diseño, tecnología y estrategia
              para crear experiencias digitales modernas, optimizadas y
              orientadas a resultados. Desarrollamos soluciones que ayudan a
              empresas, profesionales y emprendedores a crecer, conectar con sus
              clientes y generar nuevas oportunidades.
            </p>

            <div className="servicios-actions">
              <Link
                  href="/contacto"
                  className="servicios-btn-primary"
              >
                Solicitar presupuesto
              </Link>

            </div>
          </div>
        </section>

        {/* SERVICIOS */}

        <section className="servicios-lista">
          <div className="servicios-container">
            <div className="servicios-heading">
            <span className="servicios-label">
              Qué hacemos
            </span>

              <h2>
                Soluciones digitales adaptadas a las necesidades
                de cada proyecto.
              </h2>
            </div>

            <div className="servicios-grid">

              {/* WEB */}

              <article className="servicio-card">
                <FaLaptopCode className="servicio-icon" />

                <span>01</span>

                <h3>Desarrollo Web Profesional</h3>

                <p>
                  Creamos sitios web institucionales, landing pages,
                  portfolios y plataformas corporativas con diseño moderno,
                  excelente rendimiento y una experiencia de usuario clara,
                  profesional y enfocada en la conversión.
                </p>
              </article>

              {/* ECOMMERCE */}

              <article className="servicio-card">
                <FaShoppingCart className="servicio-icon" />

                <span>02</span>

                <h3>Tiendas Online y E-commerce</h3>

                <p>
                  Desarrollamos tiendas digitales preparadas para vender,
                  integrando catálogo de productos, medios de pago,
                  gestión de pedidos y una experiencia optimizada para
                  aumentar las ventas desde cualquier dispositivo.
                </p>
              </article>

              {/* APPS */}

              <article className="servicio-card">
                <FaMobileAlt className="servicio-icon" />

                <span>03</span>

                <h3>Aplicaciones Web y Móviles</h3>

                <p>
                  Diseñamos y desarrollamos aplicaciones personalizadas
                  para empresas, emprendimientos y proyectos digitales.
                  Soluciones escalables, seguras y adaptadas a las
                  necesidades específicas de cada negocio.
                </p>
              </article>

              {/* OPTIMIZACION */}

              <article className="servicio-card">
                <FaChartLine className="servicio-icon" />

                <span>04</span>

                <h3>Optimización y Presencia Digital</h3>

                <p>
                  Mejoramos rendimiento, velocidad, experiencia de usuario
                  y posicionamiento SEO para que tu sitio cargue más rápido,
                  tenga mayor visibilidad y genere más oportunidades de
                  negocio.
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="servicios-cta">
          <div className="servicios-container">
            <h2>
              Tu próximo cliente puede estar buscando exactamente
              lo que vos ofrecés.
            </h2>

            <p>
              Transformemos tu idea en una solución digital profesional,
              moderna y preparada para crecer junto a tu negocio.
            </p>

            <Link
                href="/contacto"
                className="servicios-btn-primary"
            >
              Empezar mi proyecto
            </Link>
          </div>
        </section>
      </main>
  );
}