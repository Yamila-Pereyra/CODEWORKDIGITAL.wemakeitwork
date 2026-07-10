import ServiciosPageContent from "@/components/ServiciosPageContent";
import { buildOpenGraph } from "@/lib/metadata";

const title = "Servicios";
const description =
  "Desarrollo web, aplicaciones, e-commerce y soluciones digitales para empresas y emprendedores";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/servicios",
  },
  openGraph: buildOpenGraph({
    url: "/servicios",
    title: `${title} | CodeWork Digital`,
    description,
  }),
};

export default function Servicios() {
  return <ServiciosPageContent />;
}
