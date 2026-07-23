"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getSocialLinks } from "@/lib/socialLinks";
import { translations } from "@/translations";

export default function Footer() {
    const { language } = useLanguage();

    const current = translations[language] || translations.es;
    const socialLinks = getSocialLinks(language);

    const footer =
        current.footer ||
        current.homePage?.footer ||
        translations.es.footer ||
        translations.es.homePage?.footer;

    return (
        <footer>
            <div className="footer-info">
                <h3>{footer.title}</h3>

                <a href="mailto:contact@codeworkdigital.com">
                    {footer.email}
                </a>

                <a href={socialLinks.phoneHref}>
                    {footer.phone}
                </a>
            </div>

            <p className="footer-copy">{footer.copy}</p>
        </footer>
    );
}
