import "@/styles/globals.css";
import "@/styles/quienessomos.css";
import "@/styles/servicios.css";
import "@/styles/contacto.css";
import Nav from "@/components/Nav";
import Link from "next/link";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Red_Hat_Display } from "next/font/google";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
const redHat = Red_Hat_Display({
    subsets: ["latin"],
    weight: ["400", "500", "700", "800", "900"],
});

export const metadata = {
    title: "Code Work Digital",
    description: "We make it work",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
        <body className={redHat.className}>
        <LanguageProvider>
            <header className="top-header">
                <div className="logo-container">
                    <Link href="/" className="logo-link">
                        <img
                            src="/imagenes/logofondo-neg.png"
                            className="logo-img"
                            alt="Logo Code Work Digital"
                        />

                        <img
                            src="/imagenes/Sloganazul-verde.png"
                            className="slogan-img"
                            alt="We make it work"
                        />
                    </Link>
                </div>

                <div className="nav-container">
                    <Nav />
                </div>

                <LanguageSelector />
            </header>

            <div className="main-content">{children}</div>
            <footer>

                <div className="footer-socials">

                    <a
                        href="https://instagram.com/TUUSUARIO"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaInstagram />
                    </a>

                    <a
                        href="https://facebook.com/TUPAGINA"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaFacebookF />
                    </a>

                </div>

                <div className="footer-info">

                    <h3>CodeWork Digital</h3>

                    <a href="mailto:contact@codeworkdigital.com">
                        contact@codeworkdigital.com
                    </a>

                    <a href="tel:+39XXXXXXXXX">
                        +39 XXX XXX XXXX
                    </a>

                </div>

                <p className="footer-copy">
                    © 2025 Code Work Digital — Todos los derechos reservados.
                </p>

            </footer>
            <a
                href="https://wa.me/549XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-float"
            >
                <FaWhatsapp />
            </a>
        </LanguageProvider>
        </body>
        </html>
    );
}