"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { language } = useLanguage();

  const textos = {
    es: {
      home: "Inicio",
      nosotros: "Quiénes somos",
      servicios: "Servicios",
      contacto: "Contacto",
    },
    it: {
      home: "Home",
      nosotros: "Chi siamo",
      servicios: "Servizi",
      contacto: "Contatto",
    },
    en: {
      home: "Home",
      nosotros: "About us",
      servicios: "Services",
      contacto: "Contact",
    },
  };

  const isActive = (path) => path === pathname;

  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
      <nav>
        {/* Botón hamburguesa */}
        <button
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setIsOpen(!isOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <ul className={`holder ${isOpen ? "open" : ""}`}>

          <li>
            <Link
                className={isActive("/") ? "activo" : ""}
                href="/"
                onClick={handleLinkClick}
            >
              {textos[language].home}
            </Link>
          </li>

          <li>
            <Link
                className={isActive("/quienessomos") ? "activo" : ""}
                href="/quienessomos"
                onClick={handleLinkClick}
            >
              {textos[language].nosotros}
            </Link>
          </li>

          <li>
            <Link
                className={isActive("/servicios") ? "activo" : ""}
                href="/servicios"
                onClick={handleLinkClick}
            >
              {textos[language].servicios}
            </Link>
          </li>

          <li>
            <Link
                className={isActive("/contacto") ? "activo" : ""}
                href="/contacto"
                onClick={handleLinkClick}
            >
              {textos[language].contacto}
            </Link>
          </li>

        </ul>
      </nav>
  );
}