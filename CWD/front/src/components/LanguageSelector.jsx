"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
    const [open, setOpen] = useState(false);
    const { language, setLanguage } = useLanguage();

    const changeLanguage = (lang) => {
        setLanguage(lang);
        setOpen(false);
    };

    return (
        <div className="language-selector">
            <button
                className="language-btn"
                type="button"
                onClick={() => {
                    console.log("CLICK IDIOMA");
                    setOpen((prev) => !prev);
                }}
            >
                {language?.toUpperCase() || "ES"} ▾
            </button>

            {open && (
                <div className="language-dropdown">
                    <button type="button" onClick={() => changeLanguage("es")}>
                        ES
                    </button>

                    <button type="button" onClick={() => changeLanguage("en")}>
                        EN
                    </button>

                    <button type="button" onClick={() => changeLanguage("it")}>
                        IT
                    </button>
                </div>
            )}
        </div>
    );
}