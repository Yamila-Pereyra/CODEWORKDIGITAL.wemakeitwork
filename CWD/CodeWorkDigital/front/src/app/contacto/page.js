import "@/styles/contacto.css";
import ContactForm from "@/components/ContactForm";
import { FaWhatsapp } from "react-icons/fa";

export const metadata = {
  title: "Code Work Digital - Contacto",
  description: "Contáctanos para impulsar tu negocio con soluciones web",
};

export default function Contacto() {
  return (
    <main>
      <section id="contacto" className="contacto">
        <div className="container">
          <h2 className="titulo-contacto">Contáctanos</h2>
          <p className="texto-contacto">
            Contanos sobre tu proyecto y te respondemos a la brevedad.
          </p>

          {/* FORMULARIO */}
          <ContactForm
            postUr={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contacto`}
          />

          {/* WHATSAPP */}
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
      </section>
    </main>
  );
}

