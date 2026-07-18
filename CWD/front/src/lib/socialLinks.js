const INSTAGRAM_EN_URL =
  "https://www.instagram.com/codeworkdigital?igsh=MXZ4ZGpxanhleGJwcg%3D%3D&utm_source=qr";
const INSTAGRAM_IT_URL =
  "https://www.instagram.com/codeworkdigital.it?igsh=MXB4YXVvcWJnaDJvdQ%3D%3D&utm_source=qr";
const WHATSAPP_URL = "https://wa.me/393337352719";
const PHONE_HREF = "tel:+393337352719";
const PHONE_DISPLAY = "+39 333 735 2719";

const SOCIAL_LINKS_BY_LOCALE = {
  es: {
    facebook:
      "https://www.facebook.com/share/1C4ibzzxhV/?mibextid=wwXIfr",
    instagram: INSTAGRAM_EN_URL, // Temporary fallback until the Spanish account is verified.
    whatsapp: WHATSAPP_URL,
    phoneHref: PHONE_HREF,
    phoneDisplay: PHONE_DISPLAY,
  },
  en: {
    facebook:
      "https://www.facebook.com/share/1C5ZxJgTs7/?mibextid=wwXIfr",
    instagram: INSTAGRAM_EN_URL,
    whatsapp: WHATSAPP_URL,
    phoneHref: PHONE_HREF,
    phoneDisplay: PHONE_DISPLAY,
  },
  it: {
    facebook:
      "https://www.facebook.com/share/1GL9xAk9s8/?mibextid=wwXIfr",
    instagram: INSTAGRAM_IT_URL,
    whatsapp: WHATSAPP_URL,
    phoneHref: PHONE_HREF,
    phoneDisplay: PHONE_DISPLAY,
  },
};

export function getSocialLinks(language) {
  return SOCIAL_LINKS_BY_LOCALE[language] ?? SOCIAL_LINKS_BY_LOCALE.es;
}
