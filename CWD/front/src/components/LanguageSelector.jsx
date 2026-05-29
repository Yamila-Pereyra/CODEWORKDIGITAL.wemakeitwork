"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: "es", label: "Español" },
        { code: "it", label: "Italiano" },
        { code: "en", label: "Inglés" },
    ];

    return (
        <div className="language-selector">
            <div className="language-title">
                Idiomas <span>⌄</span>
            </div>

            <div className="language-dropdown">
                {languages.map((item) => (
                    <div
                        key={item.code}
                        onClick={() => setLanguage(item.code)}
                        className={`language-option ${
                            language === item.code ? "active-lang" : ""
                        }`}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}