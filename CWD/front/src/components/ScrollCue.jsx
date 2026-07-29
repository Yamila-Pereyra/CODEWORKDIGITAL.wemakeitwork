"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const CURRENT_SCROLL_CUE_FADE_FRACTION = 0.33;
const SCROLL_CUE_FADE_RANGE_MULTIPLIER = 3;
const FULLY_HIDDEN_EPSILON = 0.001;

export default function ScrollCue() {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_SCROLL_CUE_ROUTES.has(pathname);
  const [isReady, setIsReady] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isCueVisibleState, setIsCueVisibleState] = useState(false);
  const [isDotActive, setIsDotActive] = useState(false);
  const [dotCycle, setDotCycle] = useState(0);
  const cueRef = useRef(null);
  const footerRef = useRef(null);
  const isScrollableRef = useRef(false);
  const cueOpacityRef = useRef(0);
  const frameRef = useRef(null);
  const wasFullyHiddenRef = useRef(true);
  const routeRestartPathRef = useRef(null);

  const restartDot = useCallback(() => {
    setIsDotActive(true);
    setDotCycle((cycle) => cycle + 1);
  }, []);

  const calculateCueOpacity = useCallback(() => {
    if (!footerRef.current || !isScrollableRef.current) {
      return 0;
    }

    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const maxScrollY = Math.max(
      0,
      document.documentElement.scrollHeight - viewportHeight
    );
    const footerDocumentTop =
      scrollY + footerRef.current.getBoundingClientRect().top;
    const fadeStartScrollY = footerDocumentTop - viewportHeight;
    const currentFadeDistance =
      viewportHeight * CURRENT_SCROLL_CUE_FADE_FRACTION;
    const nominalFadeDistance =
      currentFadeDistance * SCROLL_CUE_FADE_RANGE_MULTIPLIER;
    const nominalFadeEndScrollY = fadeStartScrollY + nominalFadeDistance;
    const fadeEndScrollY = Math.min(nominalFadeEndScrollY, maxScrollY);
    const effectiveFadeDistance = Math.max(
      1,
      fadeEndScrollY - fadeStartScrollY
    );

    if (maxScrollY <= fadeStartScrollY && maxScrollY - scrollY <= 1) {
      return 0;
    }

    if (scrollY < fadeStartScrollY) {
      return 1;
    }

    if (maxScrollY - scrollY <= 1) {
      return 0;
    }

    const rawProgress = (scrollY - fadeStartScrollY) / effectiveFadeDistance;
    const progress = Math.min(1, Math.max(0, rawProgress));

    if (progress >= 1) {
      return 0;
    }

    const smoothstep = progress * progress * (3 - 2 * progress);

    return 1 - smoothstep;
  }, []);

  const commitCueOpacity = useCallback(
    (nextOpacity) => {
      const clampedOpacity =
        nextOpacity <= FULLY_HIDDEN_EPSILON
          ? 0
          : Math.min(1, Math.max(0, nextOpacity));
      const wasFullyHidden = wasFullyHiddenRef.current;
      const isFullyHidden = clampedOpacity <= FULLY_HIDDEN_EPSILON;

      if (wasFullyHidden && !isFullyHidden) {
        restartDot();
        setIsCueVisibleState(true);
        wasFullyHiddenRef.current = false;
      } else if (!wasFullyHidden && isFullyHidden) {
        setIsDotActive(false);
        setIsCueVisibleState(false);
        wasFullyHiddenRef.current = true;
      }

      if (Math.abs(cueOpacityRef.current - clampedOpacity) <= FULLY_HIDDEN_EPSILON) {
        return;
      }

      cueOpacityRef.current = clampedOpacity;
      cueRef.current?.style.setProperty(
        "--scroll-cue-opacity",
        clampedOpacity.toFixed(4)
      );
    },
    [restartDot]
  );

  const updateCueOpacity = useCallback(() => {
    commitCueOpacity(calculateCueOpacity());
  }, [calculateCueOpacity, commitCueOpacity]);

  const scheduleVisibilityUpdate = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updateCueOpacity();
    });
  }, [updateCueOpacity]);

  useEffect(() => {
    let isActive = true;
    let footerObserver = null;
    let resizeObserver = null;

    setIsReady(false);
    setIsScrollable(false);
    setIsDotActive(false);
    setIsCueVisibleState(false);
    cueOpacityRef.current = 0;
    cueRef.current?.style.setProperty("--scroll-cue-opacity", "0");
    isScrollableRef.current = false;
    wasFullyHiddenRef.current = true;
    routeRestartPathRef.current = null;
    footerRef.current = null;

    if (!isPublicRoute) {
      return () => {
        isActive = false;
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }

    const footers = document.querySelectorAll("footer");
    const footer = footers.length === 1 ? footers[0] : null;

    if (!footer) {
      setIsReady(true);
      return () => {
        isActive = false;
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }
    footerRef.current = footer;

    const updateScrollable = () => {
      const nextIsScrollable = hasMeaningfulScroll();

      if (!isActive) {
        return;
      }

      isScrollableRef.current = nextIsScrollable;
      setIsScrollable((current) =>
        current === nextIsScrollable ? current : nextIsScrollable
      );
      updateCueOpacity();
    };

    updateScrollable();

    footerObserver = new IntersectionObserver(
      () => {
        if (!isActive) {
          return;
        }

        scheduleVisibilityUpdate();
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
    window.addEventListener("scroll", scheduleVisibilityUpdate, { passive: true });
    updateCueOpacity();
    setIsReady(true);

    return () => {
      isActive = false;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      footerObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollable);
      window.removeEventListener("scroll", scheduleVisibilityUpdate);
      footerRef.current = null;
      setIsDotActive(false);
    };
  }, [isPublicRoute, pathname, scheduleVisibilityUpdate, updateCueOpacity]);

  useEffect(() => {
    if (
      !isPublicRoute ||
      !isReady ||
      !isScrollable ||
      cueOpacityRef.current <= FULLY_HIDDEN_EPSILON ||
      routeRestartPathRef.current === pathname
    ) {
      return;
    }

    if (isDotActive) {
      routeRestartPathRef.current = pathname;
      return;
    }

    routeRestartPathRef.current = pathname;
    restartDot();
  }, [isDotActive, isPublicRoute, isReady, isScrollable, pathname, restartDot]);

  if (!isPublicRoute) {
    return null;
  }

  const isCueVisible = isReady && isScrollable && isCueVisibleState;

  return (
    <div
      ref={cueRef}
      className={styles.cue}
      data-scroll-cue
      data-visible={isCueVisible ? "true" : "false"}
      data-dot-active={isDotActive ? "true" : "false"}
      aria-hidden="true"
    >
      <span className={`${styles.axis} ${styles.axisTop}`} />

      <span className={styles.capsule}>
        {isDotActive && (
          <span key={`${pathname}-${dotCycle}`} className={styles.dot} />
        )}
      </span>

      <span className={`${styles.axis} ${styles.axisBottom}`} />
    </div>
  );
}
