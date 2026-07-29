"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./ParallaxWindowLab.module.css";

gsap.registerPlugin(ScrollTrigger);

const PARALLAX_WINDOW_CONFIG = Object.freeze({
  windowHeight: "34vh",
  windowMinHeight: "280px",
  windowMaxHeight: "540px",
  mobileWindowHeight: "38vh",
  mobileWindowMinHeight: "220px",
  mobileWindowMaxHeight: "360px",
  imageScale: 1.24,
  imageOverscan: "12%",
  mobileImageOverscan: "16%",
  parallaxFactor: 0.42,
  imageObjectPosition: "center center",
  scrub: 0.7,
});

export default function ParallaxWindowLab() {
  const sectionRef = useRef(null);
  const imageLayerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageLayer = imageLayerRef.current;

    if (!section || !imageLayer) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(imageLayer, {
        y: 0,
        scale: PARALLAX_WINDOW_CONFIG.imageScale,
      });

      return;
    }

    const ctx = gsap.context(() => {
      const getTravel = () =>
        section.offsetHeight * PARALLAX_WINDOW_CONFIG.parallaxFactor;

      gsap.set(imageLayer, {
        y: () => getTravel() * -0.5,
        scale: PARALLAX_WINDOW_CONFIG.imageScale,
        transformOrigin: "center center",
      });

      gsap.to(imageLayer, {
        y: () => getTravel() * 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: PARALLAX_WINDOW_CONFIG.scrub,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

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

      <section
        className={styles.windowSection}
        ref={sectionRef}
        style={{
          "--parallax-window-height": PARALLAX_WINDOW_CONFIG.windowHeight,
          "--parallax-window-min-height":
            PARALLAX_WINDOW_CONFIG.windowMinHeight,
          "--parallax-window-max-height":
            PARALLAX_WINDOW_CONFIG.windowMaxHeight,
          "--parallax-mobile-window-height":
            PARALLAX_WINDOW_CONFIG.mobileWindowHeight,
          "--parallax-mobile-window-min-height":
            PARALLAX_WINDOW_CONFIG.mobileWindowMinHeight,
          "--parallax-mobile-window-max-height":
            PARALLAX_WINDOW_CONFIG.mobileWindowMaxHeight,
          "--parallax-image-scale": PARALLAX_WINDOW_CONFIG.imageScale,
          "--parallax-image-overscan":
            PARALLAX_WINDOW_CONFIG.imageOverscan,
          "--parallax-mobile-image-overscan":
            PARALLAX_WINDOW_CONFIG.mobileImageOverscan,
          "--parallax-image-object-position":
            PARALLAX_WINDOW_CONFIG.imageObjectPosition,
        }}
        aria-label="Parallax window experiment"
      >
        <div className={styles.imageLayer} ref={imageLayerRef}>
          <Image
            src="/imagenes/labs/parallax-window/parallax-office-magenta.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className={styles.image}
          />
        </div>
      </section>

      <section className={styles.notes} aria-label="Experiment parameters">
        <p>
          La seccion no usa pinning. El movimiento se limita al eje vertical y
          queda controlado por parametros editables en el componente.
        </p>
      </section>
    </main>
  );
}
