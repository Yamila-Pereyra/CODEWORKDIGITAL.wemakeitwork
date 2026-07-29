"use client";

import ParallaxContactWindow from "@/components/parallax-contact-window/ParallaxContactWindow";
import styles from "./ParallaxWindowLab.module.css";

export default function ParallaxWindowLab() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="parallax-window-title">
        <p className={styles.eyebrow}>CWD Labs / motion study</p>

        <h1 className={styles.title} id="parallax-window-title">
          Ventana parallax edge-to-edge
        </h1>

        <p className={styles.intro}>
          Un experimento de proporcion y desplazamiento: el marco avanza con la
          pagina, mientras la imagen interna viaja con una cadencia mas lenta.
        </p>
      </section>

      <ParallaxContactWindow headingLevel="h2" />

      <section className={styles.notes} aria-label="Experiment parameters">
        <p>
          La seccion no usa pinning. El movimiento se limita al eje vertical y
          queda controlado por parametros editables en el componente.
        </p>
      </section>
    </main>
  );
}
