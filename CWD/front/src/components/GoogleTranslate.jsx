"use client";

import { useEffect } from "react";

export default function GoogleTranslate() {
    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "es",
                    includedLanguages: "es,en,it",
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        const script = document.createElement("script");
        script.src =
            "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;

        document.body.appendChild(script);
    }, []);

    return <div id="google_translate_element" style={{ display: "none" }} />;
}