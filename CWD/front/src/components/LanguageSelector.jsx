"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

const LANGUAGE_OPTIONS = [
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
    { code: "it", label: "IT" },
];

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const activeLanguage = language || "es";
    const current = translations[activeLanguage] || translations.es;
    const languageSelectorA11y =
        current.accessibility?.languageSelector ||
        translations.es.accessibility.languageSelector;
    const optionLabels = languageSelectorA11y.optionLabels;

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    return (
        <div className="language-selector">
            <span className="lang-status-dot" aria-hidden="true" />
            <span className="lang-code" aria-hidden="true">LANG = [</span>
            <div
                className="lang-options"
                role="group"
                aria-label={languageSelectorA11y.groupLabel}
            >
                {LANGUAGE_OPTIONS.map((option, index) => {
                    const isActive = option.code === activeLanguage;

                    return (
                        <span className="lang-option-wrap" key={option.code}>
                            <button
                                type="button"
                                className={`lang-option ${isActive ? "is-active" : ""}`}
                                onClick={() => changeLanguage(option.code)}
                                aria-label={optionLabels[option.code]}
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
