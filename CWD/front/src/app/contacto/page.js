import ContactoPageContent from "@/components/ContactoPageContent";
import { buildOpenGraph } from "@/lib/metadata";

const title = "Contacto";
const description =
  "¿Tenés un proyecto en mente? Escribinos y conversemos sobre cómo podemos ayudarte a hacerlo realidad.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/contacto",
  },
  openGraph: buildOpenGraph({
    url: "/contacto",
    title: `${title} | CodeWork Digital`,
    description,
  }),
};

export default function Contacto() {
  return <ContactoPageContent />;
}
