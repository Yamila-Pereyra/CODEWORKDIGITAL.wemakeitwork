export const SITE_NAME = "CodeWork Digital";
export const DEFAULT_LOCALE = "es_AR";
export const DEFAULT_OG_IMAGE = "/imagenes/logo-nombre.png";

export function buildOpenGraph({ url, title, description }) {
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: DEFAULT_LOCALE,
    url,
    title,
    description,
    images: [{ url: DEFAULT_OG_IMAGE }],
  };
}
