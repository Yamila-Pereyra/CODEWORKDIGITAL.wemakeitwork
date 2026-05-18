"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => path === pathname;

  // Para cerrar menu al hacer click en link en cel
  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
    <nav>
      {/* Boton hamburguesa, solo visible en cel */}
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
          <Link className={isActive("/") ? "activo" : ""} href="/" onClick={handleLinkClick}>
            Home
          </Link>
        </li>

        <li>
          <Link
            className={isActive("/quienessomos") ? "activo" : ""}
            href="/quienessomos"
            onClick={handleLinkClick}
          >
            Quiénes somos
          </Link>
        </li>

        <li>
          <Link
            className={isActive("/servicios") ? "activo" : ""}
            href="/servicios"
            onClick={handleLinkClick}
          >
            Servicios
          </Link>
        </li>

        <li>
          <Link
            className={isActive("/novedades") ? "activo" : ""}
            href="/novedades"
            onClick={handleLinkClick}
          >
            Novedades
          </Link>
        </li>

        <li>
          <Link
            className={isActive("/contacto") ? "activo" : ""}
            href="/contacto"
            onClick={handleLinkClick}
          >
            Contacto
          </Link>
        </li>
      </ul>
    </nav>
  );
}

