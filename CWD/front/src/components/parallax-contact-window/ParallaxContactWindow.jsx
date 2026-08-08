"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

import GlassContactForm from "./GlassContactForm";
import styles from "./ParallaxContactWindow.module.css";

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
  "--lab-glass-background-alpha": "0.0701",
  "--lab-glass-fallback-background-alpha": "0.115",
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
  "--lab-compact-breakpoint": "980px",
  "--lab-mobile-content-min-height": "840px",
  "--lab-mobile-padding-x": "clamp(18px, 6vw, 32px)",
  "--lab-mobile-padding-y": "32px",
  "--lab-mobile-field-height": "58px",
  "--lab-mobile-textarea-height": "128px",
  "--lab-mobile-layout-gap": "24px",
});

export default function ParallaxContactWindow({ className = "", headingLevel = "h2" }) {
  const { language } = useLanguage();
  const copy = translations[language].homePage.parallaxContactWindow;
  const sectionRef = useRef(null);
  const imageLayerRef = useRef(null);
  const Heading = headingLevel;
  const titleId = "parallax-contact-window-title";

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
          refreshPriority: -1,
        },
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className={`${styles.windowSection} ${className}`.trim()}
      ref={sectionRef}
      style={{
        "--parallax-window-height": PARALLAX_WINDOW_CONFIG.windowHeight,
        "--parallax-window-min-height": PARALLAX_WINDOW_CONFIG.windowMinHeight,
        "--parallax-window-max-height": PARALLAX_WINDOW_CONFIG.windowMaxHeight,
        "--parallax-mobile-window-height":
          PARALLAX_WINDOW_CONFIG.mobileWindowHeight,
        "--parallax-mobile-window-min-height":
          PARALLAX_WINDOW_CONFIG.mobileWindowMinHeight,
        "--parallax-mobile-window-max-height":
          PARALLAX_WINDOW_CONFIG.mobileWindowMaxHeight,
        "--parallax-image-scale": PARALLAX_WINDOW_CONFIG.imageScale,
        "--parallax-image-overscan": PARALLAX_WINDOW_CONFIG.imageOverscan,
        "--parallax-mobile-image-overscan":
          PARALLAX_WINDOW_CONFIG.mobileImageOverscan,
        "--parallax-image-object-position":
          PARALLAX_WINDOW_CONFIG.imageObjectPosition,
        ...LAB_CONTENT_STYLE,
      }}
      aria-labelledby={titleId}
      data-parallax-contact-window
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
              {copy.eyebrow}
            </p>
            <Heading className={styles.contactTitle} id={titleId}>
              {copy.title}
            </Heading>
            {copy.body ? (
              <p className={styles.contactBody}>
                {copy.body}
              </p>
            ) : null}
          </div>

          <GlassContactForm copy={copy.form} />
        </div>
      </div>
    </section>
  );
}
