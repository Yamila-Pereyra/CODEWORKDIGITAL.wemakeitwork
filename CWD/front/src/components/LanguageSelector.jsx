"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: "es", label: "ES", flag: "🇪🇸" },
        { code: "it", label: "IT", flag: "🇮🇹" },
        { code: "en", label: "EN", flag: "🇬🇧" },
    ];

    return (
        <div className="language-selector">
            {languages.map((item) => (
                <button
                    key={item.code}
                    onClick={() => setLanguage(item.code)}
                    className={language === item.code ? "active-lang" : ""}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}