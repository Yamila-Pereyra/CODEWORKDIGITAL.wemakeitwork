import "@/app/home1.css";
import "@/styles/contacto.css";

import HomePageContent from "@/components/HomePageContent";
import { buildOpenGraph } from "@/lib/metadata";

const title = "CodeWork Digital — Desarrollo web y soluciones digitales";
const description =
  "Diseñamos y desarrollamos sitios web, aplicaciones y e-commerce que impulsan tu negocio. Conocé nuestros servicios y trabajemos juntos.";

export const metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: buildOpenGraph({
    url: "/",
    title,
    description,
  }),
};

export default function Home() {
  return <HomePageContent />;
}
