"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
    const [open, setOpen] = useState(false);
    const { language, setLanguage } = useLanguage();

    const changeLanguage = (lang) => {
        setLanguage(lang);
        setOpen(false);

        localStorage.setItem("language", lang);

        document.documentElement.lang = lang;
    };

    return (
        <div className="language-selector">
            <button
                className="language-btn"
                type="button"
                onClick={() => setOpen((prev) => !prev)}
            >
                {language?.toUpperCase() || "ES"} ▾
            </button>

            {open && (
                <div className="language-dropdown">
                    <button onClick={() => changeLanguage("es")}>ES</button>
                    <button onClick={() => changeLanguage("en")}>EN</button>
                    <button onClick={() => changeLanguage("it")}>IT</button>
                </div>
            )}
        </div>
    );
}