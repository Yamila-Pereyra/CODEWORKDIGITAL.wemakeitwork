"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GlassContactForm from "./GlassContactForm";
import styles from "./ParallaxWindowLab.module.css";

gsap.registerPlugin(ScrollTrigger);

const PARALLAX_WINDOW_CONFIG = Object.freeze({
  windowHeight: "57.8vh",
  windowMinHeight: "476px",
  windowMaxHeight: "918px",
  mobileWindowHeight: "64.6vh",
  mobileWindowMinHeight: "374px",
  mobileWindowMaxHeight: "612px",
  imageScale: 1.24,
  imageOverscan: "100%",
  mobileImageOverscan: "100%",
  parallaxFactor: 0.6103,
  imageBaseOffsetYRatio: 0.75,
  imageObjectPosition: "center center",
  scrub: true,
});

// TODO: Replace when final editorial copy is approved.
const LAB_CONTACT_COPY = Object.freeze({
  eyebrow: "Hablemos de tu proyecto",
  title: "Construyamos algo excepcional",
  body: "Contanos sobre tu proyecto, tus objetivos y el desafio que queres resolver. Juntos podemos transformar una idea en una experiencia digital con impacto.",
  submitLabel: "Enviar mensaje",
});

const LAB_CONTENT_STYLE = Object.freeze({
  "--lab-content-max-width": "1440px",
  "--lab-content-padding-x": "clamp(32px, 6vw, 112px)",
  "--lab-content-padding-y": "clamp(34px, 5vh, 72px)",
  "--lab-layout-gap": "clamp(44px, 7vw, 112px)",
  "--lab-editorial-ratio": "0.84fr",
  "--lab-form-ratio": "1.16fr",
  "--lab-form-max-width": "720px",
  "--lab-form-columns": 2,
  "--lab-form-row-gap": "14px",
  "--lab-form-column-gap": "14px",
  "--lab-field-height": "64px",
  "--lab-textarea-height": "152px",
  "--lab-submit-height": "52px",
  "--lab-submit-padding-x": "26px",
  "--lab-submit-radius": "999px",
  "--lab-submit-font-size": "0.74rem",
  "--lab-submit-border-alpha": "0.78",
  "--lab-glass-border-width": "1px",
  "--lab-glass-border-alpha": "0.68",
  "--lab-glass-background-alpha": "0.11",
  "--lab-glass-fallback-background-alpha": "0.18",
  "--lab-glass-blur": "10px",
  "--lab-glass-saturation": "115%",
  "--lab-glass-radius": "7px",
  "--lab-glass-focus-border-alpha": "0.95",
  "--lab-glass-focus-background-alpha": "0.18",
  "--lab-focus-ring-width": "2px",
  "--lab-focus-ring-alpha": "0.48",
  "--lab-label-font-size": "0.64rem",
  "--lab-label-line-height": "1.2",
  "--lab-label-alpha": "0.86",
  "--lab-input-font-size": "0.98rem",
  "--lab-input-line-height": "1.35",
  "--lab-editorial-eyebrow-size": "clamp(0.7rem, 0.65rem + 0.22vw, 0.86rem)",
  "--lab-editorial-title-size": "clamp(2.2rem, 4.8vw, 5.9rem)",
  "--lab-editorial-body-size": "clamp(1rem, 0.94rem + 0.28vw, 1.18rem)",
  "--lab-editorial-body-line-height": "1.58",
  "--lab-editorial-text-alpha": "0.82",
  "--lab-content-shade-alpha": "0.1",
  "--lab-compact-breakpoint": "980px",
  "--lab-mobile-content-min-height": "840px",
  "--lab-mobile-padding-x": "clamp(18px, 6vw, 32px)",
  "--lab-mobile-padding-y": "32px",
  "--lab-mobile-field-height": "58px",
  "--lab-mobile-textarea-height": "128px",
  "--lab-mobile-layout-gap": "24px",
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
        y: () =>
          section.offsetHeight * PARALLAX_WINDOW_CONFIG.imageBaseOffsetYRatio,
        scale: PARALLAX_WINDOW_CONFIG.imageScale,
      });

      return;
    }

    const ctx = gsap.context(() => {
      const getTravel = () => {
        const traversalDistance = window.innerHeight + section.offsetHeight;

        return traversalDistance * PARALLAX_WINDOW_CONFIG.parallaxFactor;
      };
      const getBaseOffsetY = () =>
        section.offsetHeight * PARALLAX_WINDOW_CONFIG.imageBaseOffsetYRatio;

      gsap.set(imageLayer, {
        y: () => getTravel() * -0.5 + getBaseOffsetY(),
        scale: PARALLAX_WINDOW_CONFIG.imageScale,
        transformOrigin: "center center",
      });

      gsap.to(imageLayer, {
        y: () => getTravel() * 0.5 + getBaseOffsetY(),
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
          ...LAB_CONTENT_STYLE,
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

        <div className={styles.visualTreatmentLayer} aria-hidden="true" />

        <div className={styles.contentLayer}>
          <div className={styles.contentInner}>
            <div className={styles.editorialBlock}>
              <p className={styles.contactEyebrow}>
                {LAB_CONTACT_COPY.eyebrow}
              </p>
              <h2 className={styles.contactTitle}>
                {LAB_CONTACT_COPY.title}
              </h2>
              <p className={styles.contactBody}>
                {LAB_CONTACT_COPY.body}
              </p>
            </div>

            <GlassContactForm submitLabel={LAB_CONTACT_COPY.submitLabel} />
          </div>
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
