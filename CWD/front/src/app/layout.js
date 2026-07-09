import "@/styles/globals.css";
import "@/styles/quienessomos.css";
import "@/styles/servicios.css";
import "@/styles/contacto.css";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Link from "next/link";
import { Red_Hat_Display } from "next/font/google";
import { FaWhatsapp } from "react-icons/fa";

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
                            src="/icon.png"
                            className="logo-img"
                            alt="Isotipo Code Work Digital"
                        />
                    </Link>
                </div>

                <div className="nav-container">
                    <Nav />
                </div>

                <LanguageSelector />
            </header>

            <div className="main-content">
                {children}
            </div>

            <Footer />

            {/* Botón WhatsApp (solo móvil mediante CSS) */}
            <a
                href="https://wa.me/393337352719"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-float"
                aria-label="WhatsApp"
            >
                <FaWhatsapp />
            </a>
        </LanguageProvider>
        </body>
        </html>
    );
}