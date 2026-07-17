"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function Nav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const { language } = useLanguage();

    const current = translations[language] || translations.es;
    const textos = current;
    const navigationA11y =
        current.accessibility?.navigation ||
        translations.es.accessibility.navigation;
    const primaryNavigationId = "primary-navigation";

    const isActive = (path) => path === pathname;

    const handleLinkClick = () => {
        if (isOpen) setIsOpen(false);
    };

    return (
        <nav>
            <button
                type="button"
                className="menu-toggle"
                aria-label={
                    isOpen ? navigationA11y.closeMenu : navigationA11y.openMenu
                }
                aria-expanded={isOpen}
                aria-controls={primaryNavigationId}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            <ul
                id={primaryNavigationId}
                className={`holder ${isOpen ? "open" : ""}`}
            >
                <li>
                    <Link
                        className={isActive("/") ? "activo" : ""}
                        href="/"
                        onClick={handleLinkClick}
                    >
                        {textos.nav.home}
                    </Link>
                </li>

                <li>
                    <Link
                        className={isActive("/quienessomos") ? "activo" : ""}
                        href="/quienessomos"
                        onClick={handleLinkClick}
                    >
                        {textos.nav.nosotros}
                    </Link>
                </li>

                <li>
                    <Link
                        className={isActive("/servicios") ? "activo" : ""}
                        href="/servicios"
                        onClick={handleLinkClick}
                    >
                        {textos.nav.servicios}
                    </Link>
                </li>

                <li>
                    <Link
                        className={isActive("/contacto") ? "activo" : ""}
                        href="/contacto"
                        onClick={handleLinkClick}
                    >
                        {textos.nav.contacto}
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
