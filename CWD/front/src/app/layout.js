import "@/styles/globals.css";
import "@/styles/quienessomos.css";
import "@/styles/servicios.css";
import "@/styles/contacto.css";
import Nav from "@/components/Nav";
import Link from "next/link";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Red_Hat_Display } from "next/font/google";
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
                            src="/imagenes/logodegradea-v.png"
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
                <p>© 2025 Code Work Digital — Todos los derechos reservados.</p>
            </footer>
        </LanguageProvider>
        </body>
        </html>
    );
}