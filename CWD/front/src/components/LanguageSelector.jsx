"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const CLOSE_DELAY_MS = 160;
const MENU_EXIT_MS = 180;

export default function LanguageSelector() {
    const [open, setOpen] = useState(false);
    const [renderMenu, setRenderMenu] = useState(false);
    const [closing, setClosing] = useState(false);
    const switcherRef = useRef(null);
    const closeTimerRef = useRef(null);
    const exitTimerRef = useRef(null);
    const { language, setLanguage } = useLanguage();
    const activeLanguage = language?.toUpperCase() || "ES";
    const activeLanguageLabel =
        language === "en"
            ? "Ingles"
            : language === "it"
                ? "Italiano"
                : "Espanol";

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const clearExitTimer = () => {
        if (exitTimerRef.current) {
            clearTimeout(exitTimerRef.current);
            exitTimerRef.current = null;
        }
    };

    const openMenu = () => {
        clearCloseTimer();
        clearExitTimer();
        setClosing(false);
        setRenderMenu(true);
        setOpen(true);
    };

    const closeMenu = () => {
        clearCloseTimer();
        if (!open && !renderMenu) return;

        setOpen(false);
        setClosing(true);
        clearExitTimer();
        exitTimerRef.current = setTimeout(() => {
            setRenderMenu(false);
            setClosing(false);
            exitTimerRef.current = null;
        }, MENU_EXIT_MS);
    };

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(closeMenu, CLOSE_DELAY_MS);
    };

    const toggleMenu = () => {
        if (open) closeMenu();
        else openMenu();
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        closeMenu();

        localStorage.setItem("language", lang);

        document.documentElement.lang = lang;
    };

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (!switcherRef.current?.contains(event.target)) {
                closeMenu();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    useEffect(() => {
        return () => {
            clearCloseTimer();
            clearExitTimer();
        };
    }, []);

    return (
        <div
            className="language-selector"
            ref={switcherRef}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
        >
            <button
                className="language-btn"
                type="button"
                onClick={toggleMenu}
                aria-label={`Cambiar idioma. Idioma actual: ${activeLanguageLabel}`}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-controls="language-menu"
            >
                <span className="lang-status-dot" aria-hidden="true" />
                <span className="lang-code">
                    <span className="lang-code-prefix">LANG = [ </span>{activeLanguage}<span className="lang-code-prefix"> ]</span>
                </span>
            </button>

            {renderMenu && (
                <div
                    className={`language-dropdown ${closing ? "is-closing" : "is-open"}`}
                    id="language-menu"
                    role="menu"
                >
                    <button type="button" role="menuitem" onClick={() => changeLanguage("es")}>ES</button>
                    <button type="button" role="menuitem" onClick={() => changeLanguage("en")}>EN</button>
                    <button type="button" role="menuitem" onClick={() => changeLanguage("it")}>IT</button>
                </div>
            )}
        </div>
    );
}
