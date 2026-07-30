"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  isPublicLenisPathEnabled,
  PUBLIC_LENIS_CONFIG,
} from "./lenisScrollConfig";

let hasDisabledGsapTickerLagSmoothing = false;

const getScrollBehaviorTargets = () =>
  [document.documentElement, document.body].filter(Boolean);

export default function LenisScrollProvider() {
  const pathname = usePathname();
  const [reducedMotion, setReducedMotion] = useState(false);
  const reducedMotionReadyRef = useRef(false);
  const lenisRef = useRef(null);
  const lenisScrollHandlerRef = useRef(null);
  const gsapTickerCallbackRef = useRef(null);
  const scrollBehaviorOverridesRef = useRef([]);
  const refreshFrameRef = useRef(null);
  const refreshSettledFrameRef = useRef(null);

  const restoreScrollBehavior = () => {
    scrollBehaviorOverridesRef.current.forEach(({ element, inlineValue }) => {
      element.style.scrollBehavior = inlineValue ?? "";
    });

    scrollBehaviorOverridesRef.current = [];
  };

  const overrideScrollBehaviorIfNeeded = () => {
    restoreScrollBehavior();

    const overrides = getScrollBehaviorTargets()
      .map((element) => ({
        element,
        inlineValue: element.style.scrollBehavior,
        computedValue: window.getComputedStyle(element).scrollBehavior,
      }))
      .filter(({ computedValue }) => computedValue === "smooth");

    if (overrides.length === 0) {
      return;
    }

    overrides.forEach(({ element }) => {
      element.style.scrollBehavior = "auto";
    });

    scrollBehaviorOverridesRef.current = overrides.map(
      ({ element, inlineValue }) => ({
        element,
        inlineValue,
      })
    );
  };

  const cancelScheduledRefresh = () => {
    if (refreshFrameRef.current !== null) {
      window.cancelAnimationFrame(refreshFrameRef.current);
      refreshFrameRef.current = null;
    }

    if (refreshSettledFrameRef.current !== null) {
      window.cancelAnimationFrame(refreshSettledFrameRef.current);
      refreshSettledFrameRef.current = null;
    }
  };

  const scheduleRefresh = () => {
    cancelScheduledRefresh();

    refreshFrameRef.current = window.requestAnimationFrame(() => {
      refreshFrameRef.current = null;
      refreshSettledFrameRef.current = window.requestAnimationFrame(() => {
        refreshSettledFrameRef.current = null;
        ScrollTrigger.refresh();
      });
    });
  };

  const destroyLenis = () => {
    cancelScheduledRefresh();

    const lenis = lenisRef.current;
    const scrollHandler = lenisScrollHandlerRef.current;
    const tickerCallback = gsapTickerCallbackRef.current;

    if (tickerCallback) {
      gsap.ticker.remove(tickerCallback);
      gsapTickerCallbackRef.current = null;
    }

    if (lenis && scrollHandler) {
      lenis.off("scroll", scrollHandler);
      lenisScrollHandlerRef.current = null;
    }

    if (lenis) {
      lenis.destroy();
      lenisRef.current = null;
    }

    restoreScrollBehavior();
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyReducedMotion = () => {
      reducedMotionReadyRef.current = true;
      setReducedMotion(mediaQuery.matches);
    };

    applyReducedMotion();
    mediaQuery.addEventListener("change", applyReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", applyReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (!reducedMotionReadyRef.current) {
      return;
    }

    const isEnabledPath = isPublicLenisPathEnabled(pathname);

    if (!isEnabledPath || reducedMotion) {
      destroyLenis();

      if (pathname === "/") {
        scheduleRefresh();
      }

      return;
    }

    if (!hasDisabledGsapTickerLagSmoothing) {
      gsap.ticker.lagSmoothing(0);
      hasDisabledGsapTickerLagSmoothing = true;
    }

    overrideScrollBehaviorIfNeeded();

    const lenis = new Lenis({
      autoRaf: false,
      lerp: PUBLIC_LENIS_CONFIG.lerp,
      smoothWheel: PUBLIC_LENIS_CONFIG.smoothWheel,
      wheelMultiplier: PUBLIC_LENIS_CONFIG.wheelMultiplier,
      syncTouch: PUBLIC_LENIS_CONFIG.syncTouch,
    });

    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };

    const handleGsapTick = (time) => {
      lenis.raf(time * 1000);
    };

    lenisRef.current = lenis;
    lenisScrollHandlerRef.current = handleLenisScroll;
    gsapTickerCallbackRef.current = handleGsapTick;

    lenis.on("scroll", handleLenisScroll);
    gsap.ticker.add(handleGsapTick);
    scheduleRefresh();

    return () => {
      if (lenisRef.current === lenis) {
        destroyLenis();
      }
    };
  }, [pathname, reducedMotion]);

  useEffect(() => {
    const isEnabledPath = isPublicLenisPathEnabled(pathname);

    const handleResizeLikeEvent = () => {
      if (!isEnabledPath) {
        return;
      }

      if (lenisRef.current) {
        lenisRef.current.resize();
      }

      scheduleRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !isEnabledPath) {
        return;
      }

      if (lenisRef.current) {
        lenisRef.current.resize();
      }

      scheduleRefresh();
    };

    window.addEventListener("resize", handleResizeLikeEvent, {
      passive: true,
    });
    window.addEventListener("orientationchange", handleResizeLikeEvent, {
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResizeLikeEvent);
      window.removeEventListener("orientationchange", handleResizeLikeEvent);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [pathname]);

  useEffect(() => {
    return () => {
      destroyLenis();
    };
  }, []);

  return null;
}
