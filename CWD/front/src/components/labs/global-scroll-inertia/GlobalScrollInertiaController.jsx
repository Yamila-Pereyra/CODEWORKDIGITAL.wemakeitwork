"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

export const LENIS_LAB_DEFAULTS = Object.freeze({
  enabled: true,
  lerp: 0.14,
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: false,
  stopInertiaOnNavigate: true,
});

const HUD_UPDATE_INTERVAL_MS = 100;
const NATIVE_SCROLL_ACTIVITY_WINDOW_MS = 120;
const PENDING_DISTANCE_EPSILON_PX = 0.5;
const MOTION_EPSILON_PX = 0.01;
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isEditableTarget = (target) => {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest("[data-scroll-inertia-controls]")) {
    return true;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

const getScrollElement = () =>
  document.scrollingElement ?? document.documentElement;

const getScrollLimit = () =>
  Math.max(0, getScrollElement().scrollHeight - window.innerHeight);

const formatNumber = (value, digits) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toFixed(digits);
};

const getDirectionLabel = (direction) =>
  direction > 0 ? "DOWN" : direction < 0 ? "UP" : "IDLE";

const getIsScrollingLabel = (value) => {
  if (value === false) {
    return "FALSE";
  }

  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return value ? "TRUE" : "FALSE";
};

const getModeLabel = (enabled, reducedMotion) => {
  if (reducedMotion) {
    return "NATIVE — REDUCED MOTION";
  }

  return enabled ? "LENIS" : "NATIVE";
};

export default function GlobalScrollInertiaController({
  settings,
  telemetryRef,
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const reducedMotionRef = useRef(false);
  const settingsRef = useRef(settings);
  const lenisRef = useRef(null);
  const lenisScrollCallbackRef = useRef(null);
  const telemetryIntervalRef = useRef(null);
  const lastHudWriteAtRef = useRef(0);
  const reducedMotionReadyRef = useRef(false);
  const scrollBehaviorOverridesRef = useRef([]);
  const latestMetricsRef = useRef({
    actualScroll: 0,
    animatedScroll: 0,
    targetScroll: 0,
    velocity: 0,
    lastVelocity: 0,
    direction: 0,
    isScrolling: false,
    progress: 0,
    limit: 0,
  });
  const nativeSnapshotRef = useRef({
    previousScrollY: 0,
    previousTimestamp: 0,
    velocity: 0,
    lastVelocity: 0,
    direction: 0,
    lastScrollAt: 0,
  });
  const diagnosticsRef = useRef({
    lastInputAt: 0,
    lastMotionAt: 0,
    pendingGapStartedAt: 0,
    maxPendingStationaryGapMs: 0,
    lastAnimatedScroll: 0,
  });

  settingsRef.current = settings;

  const updateContinuityDiagnostics = (metrics) => {
    const diagnostics = diagnosticsRef.current;
    const now = performance.now();
    const remainingDistance = Math.abs(
      metrics.targetScroll - metrics.animatedScroll
    );
    const animatedDelta = Math.abs(
      metrics.animatedScroll - diagnostics.lastAnimatedScroll
    );

    if (remainingDistance > PENDING_DISTANCE_EPSILON_PX) {
      if (animatedDelta > MOTION_EPSILON_PX) {
        if (diagnostics.pendingGapStartedAt > 0) {
          diagnostics.maxPendingStationaryGapMs = Math.max(
            diagnostics.maxPendingStationaryGapMs,
            now - diagnostics.pendingGapStartedAt
          );
          diagnostics.pendingGapStartedAt = 0;
        }

        diagnostics.lastMotionAt = now;
      } else if (diagnostics.pendingGapStartedAt === 0) {
        diagnostics.pendingGapStartedAt = now;
      }
    } else if (diagnostics.pendingGapStartedAt > 0) {
      diagnostics.maxPendingStationaryGapMs = Math.max(
        diagnostics.maxPendingStationaryGapMs,
        now - diagnostics.pendingGapStartedAt
      );
      diagnostics.pendingGapStartedAt = 0;
    }

    diagnostics.lastAnimatedScroll = metrics.animatedScroll;
  };

  const updateTelemetryDiagnostics = () => {
    if (!telemetryRef.current) {
      return;
    }

    telemetryRef.current.diagnostics = {
      lastInputAt: diagnosticsRef.current.lastInputAt,
      lastMotionAt: diagnosticsRef.current.lastMotionAt,
      maxPendingStationaryGapMs:
        diagnosticsRef.current.maxPendingStationaryGapMs,
      pendingDistanceEpsilonPx: PENDING_DISTANCE_EPSILON_PX,
    };
  };

  const syncNativeMetrics = () => {
    const now = performance.now();
    const currentScrollY = window.scrollY;
    const nativeSnapshot = nativeSnapshotRef.current;
    const deltaY = currentScrollY - nativeSnapshot.previousScrollY;
    const elapsedMs =
      nativeSnapshot.previousTimestamp > 0
        ? Math.max(now - nativeSnapshot.previousTimestamp, 1)
        : 16.667;

    if (deltaY !== 0) {
      nativeSnapshot.lastVelocity = nativeSnapshot.velocity;
      nativeSnapshot.velocity = deltaY / elapsedMs;
      nativeSnapshot.direction = deltaY > 0 ? 1 : -1;
      nativeSnapshot.lastScrollAt = now;
    } else if (
      now - nativeSnapshot.lastScrollAt >
      NATIVE_SCROLL_ACTIVITY_WINDOW_MS
    ) {
      nativeSnapshot.lastVelocity = nativeSnapshot.velocity;
      nativeSnapshot.velocity = 0;
      nativeSnapshot.direction = 0;
    }

    nativeSnapshot.previousScrollY = currentScrollY;
    nativeSnapshot.previousTimestamp = now;

    const limit = getScrollLimit();
    const metrics = {
      actualScroll: currentScrollY,
      animatedScroll: currentScrollY,
      targetScroll: currentScrollY,
      velocity: nativeSnapshot.velocity,
      lastVelocity: nativeSnapshot.lastVelocity,
      direction: nativeSnapshot.direction,
      isScrolling:
        now - nativeSnapshot.lastScrollAt <= NATIVE_SCROLL_ACTIVITY_WINDOW_MS
          ? "native"
          : false,
      progress: limit > 0 ? clamp(currentScrollY / limit, 0, 1) : 0,
      limit,
    };

    latestMetricsRef.current = metrics;
    updateContinuityDiagnostics(metrics);
  };

  const syncLenisMetrics = (instance = lenisRef.current) => {
    if (!instance) {
      syncNativeMetrics();
      return;
    }

    const metrics = {
      actualScroll: instance.actualScroll,
      animatedScroll: instance.animatedScroll,
      targetScroll: instance.targetScroll,
      velocity: instance.velocity,
      lastVelocity: instance.lastVelocity,
      direction: instance.direction,
      isScrolling: instance.isScrolling,
      progress: instance.progress,
      limit: instance.limit,
    };

    latestMetricsRef.current = metrics;
    updateContinuityDiagnostics(metrics);
  };

  const restoreScrollBehavior = () => {
    scrollBehaviorOverridesRef.current.forEach(({ element, inlineValue }) => {
      element.style.scrollBehavior = inlineValue ?? "";
    });

    scrollBehaviorOverridesRef.current = [];
  };

  const overrideScrollBehaviorIfNeeded = () => {
    restoreScrollBehavior();

    const targets = [document.documentElement, document.body].filter(Boolean);
    const overrides = targets
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

  const destroyLenis = (instance = lenisRef.current) => {
    if (!instance) {
      restoreScrollBehavior();
      return;
    }

    const callback = lenisScrollCallbackRef.current;

    if (callback) {
      instance.off("scroll", callback);
    }

    lenisScrollCallbackRef.current = null;
    lenisRef.current = null;
    instance.destroy();
    restoreScrollBehavior();
  };

  const writeTelemetry = (force = false) => {
    const now = performance.now();

    if (!force && now - lastHudWriteAtRef.current < HUD_UPDATE_INTERVAL_MS) {
      return;
    }

    lastHudWriteAtRef.current = now;
    const nodes = telemetryRef.current?.nodes ?? {};
    const metrics = latestMetricsRef.current;
    const currentSettings = settingsRef.current;
    const values = {
      mode: getModeLabel(currentSettings.enabled, reducedMotionRef.current),
      reducedMotion: reducedMotionRef.current ? "REDUCE" : "NO-PREFERENCE",
      actualScroll: formatNumber(metrics.actualScroll, 1),
      animatedScroll: formatNumber(metrics.animatedScroll, 1),
      targetScroll: formatNumber(metrics.targetScroll, 1),
      remainingDistance: formatNumber(
        metrics.targetScroll - metrics.animatedScroll,
        1
      ),
      velocity: formatNumber(metrics.velocity, 3),
      lastVelocity: formatNumber(metrics.lastVelocity, 3),
      direction: getDirectionLabel(metrics.direction),
      isScrolling: getIsScrollingLabel(metrics.isScrolling),
      progress: formatNumber(metrics.progress, 4),
      limit: formatNumber(metrics.limit, 1),
      lerp: formatNumber(currentSettings.lerp, 2),
      wheelMultiplier: formatNumber(currentSettings.wheelMultiplier, 2),
      smoothWheel: currentSettings.smoothWheel ? "TRUE" : "FALSE",
    };

    Object.entries(values).forEach(([key, value]) => {
      if (nodes[key]) {
        nodes[key].textContent = value;
      }
    });

    updateTelemetryDiagnostics();
  };

  useEffect(() => {
    syncNativeMetrics();
    writeTelemetry(true);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyReducedMotion = () => {
      reducedMotionReadyRef.current = true;
      reducedMotionRef.current = mediaQuery.matches;
      setReducedMotion(mediaQuery.matches);
    };

    const markInput = () => {
      diagnosticsRef.current.lastInputAt = performance.now();
    };

    const onKeyDown = (event) => {
      if (!SCROLL_KEYS.has(event.key) || isEditableTarget(event.target)) {
        return;
      }

      markInput();
    };

    const onWindowScroll = () => {
      if (lenisRef.current) {
        return;
      }

      syncNativeMetrics();
      writeTelemetry();
    };

    const onResizeLikeEvent = () => {
      if (lenisRef.current) {
        lenisRef.current.resize();
        syncLenisMetrics();
      } else {
        syncNativeMetrics();
      }

      writeTelemetry(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && lenisRef.current) {
        lenisRef.current.resize();
        syncLenisMetrics();
      } else if (!lenisRef.current) {
        syncNativeMetrics();
      }

      writeTelemetry(true);
    };

    applyReducedMotion();

    telemetryIntervalRef.current = window.setInterval(() => {
      if (lenisRef.current) {
        syncLenisMetrics();
      } else {
        syncNativeMetrics();
      }

      writeTelemetry();
    }, HUD_UPDATE_INTERVAL_MS);

    window.addEventListener("wheel", markInput, { passive: true });
    window.addEventListener("touchstart", markInput, { passive: true });
    window.addEventListener("touchmove", markInput, { passive: true });
    window.addEventListener("pointerdown", markInput, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", onResizeLikeEvent, { passive: true });
    window.addEventListener("orientationchange", onResizeLikeEvent, {
      passive: true,
    });
    document.addEventListener("visibilitychange", onVisibilityChange);
    mediaQuery.addEventListener("change", applyReducedMotion);

    return () => {
      if (telemetryIntervalRef.current !== null) {
        window.clearInterval(telemetryIntervalRef.current);
        telemetryIntervalRef.current = null;
      }

      window.removeEventListener("wheel", markInput);
      window.removeEventListener("touchstart", markInput);
      window.removeEventListener("touchmove", markInput);
      window.removeEventListener("pointerdown", markInput);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", onResizeLikeEvent);
      window.removeEventListener("orientationchange", onResizeLikeEvent);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mediaQuery.removeEventListener("change", applyReducedMotion);
      destroyLenis();
      writeTelemetry(true);
    };
  }, [telemetryRef]);

  useEffect(() => {
    if (!reducedMotionReadyRef.current) {
      return;
    }

    if (reducedMotion || !settings.enabled) {
      syncNativeMetrics();
      writeTelemetry(true);
      return;
    }

    overrideScrollBehaviorIfNeeded();

    const instance = new Lenis({
      autoRaf: true,
      lerp: settings.lerp,
      smoothWheel: settings.smoothWheel,
      wheelMultiplier: settings.wheelMultiplier,
      syncTouch: false,
      stopInertiaOnNavigate: settings.stopInertiaOnNavigate,
    });

    const handleLenisScroll = (lenis) => {
      syncLenisMetrics(lenis);
      writeTelemetry();
    };

    lenisRef.current = instance;
    lenisScrollCallbackRef.current = handleLenisScroll;
    instance.on("scroll", handleLenisScroll);
    syncLenisMetrics(instance);
    writeTelemetry(true);

    return () => {
      if (lenisRef.current === instance) {
        destroyLenis(instance);
        syncNativeMetrics();
        writeTelemetry(true);
      }
    };
  }, [
    reducedMotion,
    settings.enabled,
    settings.lerp,
    settings.smoothWheel,
    settings.stopInertiaOnNavigate,
    settings.wheelMultiplier,
  ]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    writeTelemetry(true);
  }, [reducedMotion, settings]);

  return null;
}
