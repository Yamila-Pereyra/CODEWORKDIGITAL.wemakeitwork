import ContactForm from "@/components/ContactForm";
import OpticalDivider from "@/components/OpticalDivider";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook
} from "react-icons/fa";

export const metadata = {
  title: "Code Work Digital - Contacto",
  description: "Hablemos sobre tu próximo proyecto digital",
};

export default function Contacto() {
  return (
      <main className="contacto-page">
        <section id="contacto" className="contacto-section optical-divider-host">
          <div className="contacto-container">

            {/* REDES SOCIALES ARRIBA */}

            <div className="contacto-top-social">

              <a
                  href="https://www.instagram.com/codeworkdigital/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                  href="https://facebook.com/TU_FACEBOOK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Facebook"
              >
                <FaFacebook />
              </a>

              <a
                  href="https://wa.me/393393309228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>

            </div>

            {/* HEADER */}

            <div className="contacto-header">

            <span className="contacto-label">
              Contacto
            </span>

              <h1>
                Hablemos sobre tu próximo proyecto digital.
              </h1>

              <p>
                Contanos qué necesitás crear, mejorar o impulsar.
                Te respondemos a la brevedad para ayudarte a
                transformar tu idea en una solución digital
                profesional, moderna y preparada para crecer.
              </p>

            </div>

            {/* CONTENIDO */}

            <div className="contacto-layout">

              <div className="contacto-info">

                <h2>
                  ¿Cómo podemos ayudarte?
                </h2>

                <p>
                  Podemos acompañarte en el desarrollo de sitios web,
                  aplicaciones web, aplicaciones móviles, tiendas
                  online y soluciones digitales pensadas para
                  potenciar tu marca, optimizar procesos y generar
                  nuevas oportunidades de negocio.
                </p>

                <ul>
                  <li>Diseño y desarrollo web profesional</li>
                  <li>Aplicaciones web a medida</li>
                  <li>Aplicaciones móviles (Android e iOS)</li>
                  <li>Tiendas online y e-commerce</li>
                  <li>Landing pages para campañas</li>
                  <li>Optimización y posicionamiento digital</li>
                </ul>

              </div>

              <div className="contacto-form-card">

                <ContactForm
                    postUr={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contacto`}
                />

                <div className="whatsapp-contacto">

                  <a
                      href="https://wa.me/393393309228"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                  >
                    <FaWhatsapp className="whatsapp-icon" />
                    Enviar WhatsApp
                  </a>

                </div>

              </div>

            </div>

          </div>
          <OpticalDivider />
        </section>
      </main>
  );
}
