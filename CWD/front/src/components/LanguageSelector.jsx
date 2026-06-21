"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LANGUAGE_OPTIONS = [
    { code: "es", label: "ES", name: "Espanol" },
    { code: "en", label: "EN", name: "Ingles" },
    { code: "it", label: "IT", name: "Italiano" },
];

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const activeLanguage = language || "es";

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        document.documentElement.lang = lang;
    };

    return (
        <div
            className="language-selector"
            aria-label="Selector de idioma"
        >
            <span className="lang-status-dot" aria-hidden="true" />
            <span className="lang-code" aria-hidden="true">LANG = [</span>
            <div className="lang-options" role="group" aria-label="Cambiar idioma">
                {LANGUAGE_OPTIONS.map((option, index) => {
                    const isActive = option.code === activeLanguage;

                    return (
                        <span className="lang-option-wrap" key={option.code}>
                            <button
                                type="button"
                                className={`lang-option ${isActive ? "is-active" : ""}`}
                                onClick={() => changeLanguage(option.code)}
                                aria-label={`Cambiar idioma a ${option.name}`}
                                aria-pressed={isActive}
                            >
                                {option.label}
                            </button>
                            {index < LANGUAGE_OPTIONS.length - 1 && (
                                <span className="lang-separator" aria-hidden="true">·</span>
                            )}
                        </span>
                    );
                })}
            </div>
            <span className="lang-code" aria-hidden="true">]</span>
        </div>
    );
}
