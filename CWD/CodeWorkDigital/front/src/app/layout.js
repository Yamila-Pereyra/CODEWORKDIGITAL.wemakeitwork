import "@/styles/globals.css";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = {
  title: "Code Work Digital",
  description: "Soluciones web que impulsan tu negocio",
};

export default function RootLayout({ children }) {
  return (
      <html lang="es">
      <body>

      {/* HEADER */}
      <header className="top-header">

        {/* LOGO */}
        <div className="logo-container">
          <Link href="/" className="logo-link">
            <img
                src="/imagenes/LOGONEGRO.png"
                className="logo-img"
                alt="Logo"
            />

            <img
                src="/imagenes/slogan.jpeg"
                className="slogan-img"
                alt="Slogan"
            />
          </Link>
        </div>

        {/* NAV */}
        <div className="nav-container">
          <Nav />
        </div>

        {/* IDIOMAS */}
        <div className="language-selector">
          <button>ES</button>
          <button>IT</button>
          <button>EN</button>
        </div>

      </header>

      {/* CONTENIDO */}
      <main className="main-content">
        {children}
      </main>

      {/* FOOTER */}
      <footer>
        <p>© 2025 CodeWork Digital — Todos los derechos reservados.</p>
      </footer>

      </body>
      </html>
  );
}
