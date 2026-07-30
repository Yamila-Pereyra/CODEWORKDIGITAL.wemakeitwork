"use client";

import { useRef, useState } from "react";

import ParallaxContactWindow from "@/components/parallax-contact-window/ParallaxContactWindow";
import GlobalScrollInertiaController, {
  GLOBAL_SCROLL_INERTIA_DEFAULTS,
} from "./GlobalScrollInertiaController";
import GlobalScrollInertiaHud from "./GlobalScrollInertiaHud";
import styles from "./GlobalScrollInertiaLab.module.css";

const NARRATIVE_BLOCKS = [
  {
    marker: "01 — Continuidad",
    body: "El desplazamiento no debería terminar como un corte.",
  },
  {
    marker: "02 — Ligereza",
    body: "La respuesta debe conservar movimiento sin transmitir peso.",
  },
  {
    marker: "03 — Control",
    body: "El usuario siempre debe recuperar el mando de forma inmediata.",
  },
];

const LAB_STYLE = {
  "--scroll-inertia-prelude-min-height": "86vh",
  "--scroll-inertia-sticky-height": "240vh",
  "--scroll-inertia-sticky-top": "22vh",
  "--scroll-inertia-narrative-block-height": "70vh",
  "--scroll-inertia-content-max-width": "1380px",
  "--scroll-inertia-section-padding-x": "clamp(22px, 5vw, 96px)",
  "--scroll-inertia-section-padding-y": "clamp(72px, 10vh, 132px)",
  "--scroll-inertia-hud-width": "min(380px, calc(100vw - 28px))",
  "--scroll-inertia-hud-top": "18px",
  "--scroll-inertia-hud-right": "18px",
  "--scroll-inertia-closing-height": "108vh",
};

export default function GlobalScrollInertiaLab() {
  const [settings, setSettings] = useState(GLOBAL_SCROLL_INERTIA_DEFAULTS);
  const telemetryRef = useRef({ nodes: {} });

  return (
    <main className={styles.lab} style={LAB_STYLE}>
      <GlobalScrollInertiaController
        settings={settings}
        telemetryRef={telemetryRef}
      />
      <GlobalScrollInertiaHud
        settings={settings}
        onSettingsChange={setSettings}
        telemetryRef={telemetryRef}
      />

      <section className={styles.prelude} aria-labelledby="scroll-inertia-title">
        <div className={styles.copyBlock}>
          <p className={styles.eyebrow}>LAB — GLOBAL SCROLL INERTIA</p>
          <h1 id="scroll-inertia-title">
            El movimiento también comunica.
          </h1>
          <p>
            Una breve explicación sobre continuidad, ritmo y exploración.
          </p>
        </div>
      </section>

      <section className={styles.stickySection} aria-labelledby="sticky-title">
        <div className={styles.stickyGrid}>
          <aside className={styles.stickyCopy}>
            <p className={styles.eyebrow}>SCROLL REAL</p>
            <h2 id="sticky-title">Sticky nativo bajo una cola ligera.</h2>
            <p>
              Esta zona prueba entrada, permanencia y liberación de un sticky
              sin pinning ni timelines externos.
            </p>
          </aside>

          <div className={styles.narrativeRail}>
            {NARRATIVE_BLOCKS.map((block) => (
              <article className={styles.narrativeBlock} key={block.marker}>
                <p className={styles.blockMarker}>{block.marker}</p>
                <p>{block.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ParallaxContactWindow headingLevel="h2" />

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.copyBlock}>
          <p className={styles.eyebrow}>CONTINUIDAD</p>
          <h2 id="closing-title">
            Detenerse no tiene por qué sentirse como un corte.
          </h2>
          <p className={styles.endMarker}>END OF DOCUMENT</p>
        </div>
      </section>
    </main>
  );
}
