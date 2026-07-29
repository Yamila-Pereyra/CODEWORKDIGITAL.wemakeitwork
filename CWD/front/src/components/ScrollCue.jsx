"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import styles from "./ScrollCue.module.css";

const PUBLIC_SCROLL_CUE_ROUTES = new Set([
  "/",
  "/quienessomos",
  "/servicios",
  "/contacto",
]);

const hasMeaningfulScroll = () =>
  document.documentElement.scrollHeight > document.documentElement.clientHeight + 1;

export default function ScrollCue() {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_SCROLL_CUE_ROUTES.has(pathname);
  const [isReady, setIsReady] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isDotActive, setIsDotActive] = useState(false);
  const [dotCycle, setDotCycle] = useState(0);

  useEffect(() => {
    let isActive = true;
    let footerObserver = null;
    let resizeObserver = null;

    setIsReady(false);
    setIsScrollable(false);
    setIsFooterVisible(false);
    setIsDotActive(false);

    if (!isPublicRoute) {
      return () => {
        isActive = false;
      };
    }

    const footers = document.querySelectorAll("footer");
    const footer = footers.length === 1 ? footers[0] : null;

    if (!footer) {
      setIsReady(true);
      return () => {
        isActive = false;
      };
    }

    const updateScrollable = () => {
      const nextIsScrollable = hasMeaningfulScroll();

      if (!isActive) {
        return;
      }

      setIsScrollable((current) =>
        current === nextIsScrollable ? current : nextIsScrollable
      );
    };

    const footerRect = footer.getBoundingClientRect();
    const footerInitiallyVisible =
      footerRect.top < window.innerHeight && footerRect.bottom > 0;

    updateScrollable();
    setIsFooterVisible(footerInitiallyVisible);

    footerObserver = new IntersectionObserver(
      ([entry]) => {
        if (!isActive) {
          return;
        }

        setIsFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    footerObserver.observe(footer);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateScrollable);
      resizeObserver.observe(document.documentElement);

      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    window.addEventListener("resize", updateScrollable, { passive: true });
    setIsReady(true);

    return () => {
      isActive = false;
      footerObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollable);
    };
  }, [isPublicRoute, pathname]);

  const isCueVisible = isReady && isScrollable && !isFooterVisible;

  useEffect(() => {
    if (!isCueVisible) {
      return;
    }

    setIsDotActive(true);
    setDotCycle((current) => current + 1);
  }, [isCueVisible]);

  if (!isPublicRoute) {
    return null;
  }

  const handleCueTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity") {
      return;
    }

    if (!isCueVisible) {
      setIsDotActive(false);
    }
  };

  return (
    <div
      className={styles.cue}
      data-scroll-cue
      data-visible={isCueVisible ? "true" : "false"}
      data-dot-active={isDotActive ? "true" : "false"}
      aria-hidden="true"
      onTransitionEnd={handleCueTransitionEnd}
    >
      <span className={`${styles.axis} ${styles.axisTop}`} />

      <span className={styles.capsule}>
        {isDotActive && <span key={dotCycle} className={styles.dot} />}
      </span>

      <span className={`${styles.axis} ${styles.axisBottom}`} />
    </div>
  );
}
