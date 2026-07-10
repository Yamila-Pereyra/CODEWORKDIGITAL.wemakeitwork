import QuienesSomosPageContent from "@/components/QuienesSomosPageContent";
import { buildOpenGraph } from "@/lib/metadata";

const title = "Quiénes somos";
const description =
  "Conocé al equipo de CodeWork Digital: quiénes somos, cómo trabajamos y por qué elegirnos como socio tecnológico para tu próximo proyecto.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/quienessomos",
  },
  openGraph: buildOpenGraph({
    url: "/quienessomos",
    title: `${title} | CodeWork Digital`,
    description,
  }),
};

export default function QuienesSomos() {
  return <QuienesSomosPageContent />;
}
