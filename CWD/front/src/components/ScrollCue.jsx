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

const END_FADE_VIEWPORT_RATIO = 0.33;
const FULLY_HIDDEN_EPSILON = 0.001;
const OPACITY_UPDATE_EPSILON = 0.001;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const smootherstep = (progress) =>
  progress * progress * progress * (progress * (progress * 6 - 15) + 10);

export default function ScrollCue() {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_SCROLL_CUE_ROUTES.has(pathname);
  const [isReady, setIsReady] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isCueVisibleState, setIsCueVisibleState] = useState(false);
  const [isDotActive, setIsDotActive] = useState(false);
  const [dotCycle, setDotCycle] = useState(0);
  const cueRef = useRef(null);
  const isScrollableRef = useRef(false);
  const fadeGeometryRef = useRef({
    maxScrollY: 0,
    fadeDistance: 0,
    fadeStartScrollY: 0,
  });
  const cueOpacityRef = useRef(0);
  const frameRef = useRef(null);
  const wasFullyHiddenRef = useRef(true);
  const routeRestartPathRef = useRef(null);

  const restartDot = useCallback(() => {
    setIsDotActive(true);
    setDotCycle((cycle) => cycle + 1);
  }, []);

  const calculateFadeGeometry = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScrollY = Math.max(
      0,
      documentHeight - viewportHeight
    );
    const requestedFadeDistance = viewportHeight * END_FADE_VIEWPORT_RATIO;
    const fadeDistance = Math.min(requestedFadeDistance, maxScrollY);
    const fadeStartScrollY = Math.max(
      0,
      maxScrollY - fadeDistance
    );

    return {
      maxScrollY,
      fadeDistance,
      fadeStartScrollY,
    };
  }, []);

  const calculateCueOpacity = useCallback(() => {
    if (!isScrollableRef.current) {
      return 0;
    }

    const { maxScrollY, fadeDistance, fadeStartScrollY } =
      fadeGeometryRef.current;
    const scrollY = clamp(window.scrollY, 0, maxScrollY);

    if (scrollY <= fadeStartScrollY) {
      return 1;
    }

    if (maxScrollY - scrollY <= 1) {
      return 0;
    }

    const progress = clamp(
      (scrollY - fadeStartScrollY) / fadeDistance,
      0,
      1
    );

    if (progress >= 1) {
      return 0;
    }

    const easedProgress = smootherstep(progress);
    const opacity = 1 - easedProgress;

    return opacity <= FULLY_HIDDEN_EPSILON ? 0 : opacity;
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

      if (
        Math.abs(cueOpacityRef.current - clampedOpacity) <=
        OPACITY_UPDATE_EPSILON
      ) {
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
    let resizeObserver = null;

    setIsReady(false);
    setIsScrollable(false);
    setIsDotActive(false);
    setIsCueVisibleState(false);
    cueOpacityRef.current = 0;
    cueRef.current?.style.setProperty("--scroll-cue-opacity", "0");
    isScrollableRef.current = false;
    fadeGeometryRef.current = {
      maxScrollY: 0,
      fadeDistance: 0,
      fadeStartScrollY: 0,
    };
    wasFullyHiddenRef.current = true;
    routeRestartPathRef.current = null;

    if (!isPublicRoute) {
      return () => {
        isActive = false;
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }

    const updateScrollable = () => {
      const nextIsScrollable = hasMeaningfulScroll();

      if (!isActive) {
        return;
      }

      isScrollableRef.current = nextIsScrollable;
      fadeGeometryRef.current = calculateFadeGeometry();
      setIsScrollable((current) =>
        current === nextIsScrollable ? current : nextIsScrollable
      );
      updateCueOpacity();
    };

    updateScrollable();

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
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollable);
      window.removeEventListener("scroll", scheduleVisibilityUpdate);
      setIsDotActive(false);
    };
  }, [
    calculateFadeGeometry,
    isPublicRoute,
    pathname,
    scheduleVisibilityUpdate,
    updateCueOpacity,
  ]);

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
