import "lenis/dist/lenis.css";

import GlobalScrollInertiaLab from "@/components/labs/global-scroll-inertia/GlobalScrollInertiaLab";

export const metadata = {
  title: "Global Scroll Inertia Lab | CodeWork Digital",
  description:
    "Laboratorio aislado para evaluar una cola inercial ligera aplicada al scroll real del documento.",
};

export default function GlobalScrollInertiaLabPage() {
  return <GlobalScrollInertiaLab />;
}
