"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();
const SUPPORTED_LANGUAGES = ["es", "en", "it"];
const DEFAULT_LANGUAGE = "es";

function normalizeLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
    const [languageReady, setLanguageReady] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        const nextLanguage = normalizeLanguage(savedLanguage);

        setLanguageState(nextLanguage);
        document.documentElement.lang = nextLanguage;
        setLanguageReady(true);
    }, []);

    const setLanguage = (lang) => {
        const nextLanguage = normalizeLanguage(lang);

        setLanguageState(nextLanguage);
        localStorage.setItem("language", nextLanguage);
        document.documentElement.lang = nextLanguage;
    };

    if (!languageReady) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, languageReady }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
