"use client";

import { useEffect, useRef } from "react";

export const SCROLL_INERTIA_STATES = Object.freeze({
  IDLE: "IDLE",
  USER_SCROLLING: "USER_SCROLLING",
  INERTIA_SETTLING: "INERTIA_SETTLING",
});

export const GLOBAL_SCROLL_INERTIA_DEFAULTS = Object.freeze({
  enabled: true,
  distancePx: 32,
  durationMs: 300,
  scrollEndDelayMs: 48,
  minGestureDistancePx: 12,
  boundaryEpsilonPx: 1,
});

const INTENT_WINDOW_MS = 420;
const HUD_UPDATE_INTERVAL_MS = 100;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const easeOutCubic = (progress) =>
  1 - Math.pow(1 - progress, 3);

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

const getMaxScrollY = () =>
  Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );

const getScrollBehaviorElement = () => document.documentElement;

export default function GlobalScrollInertiaController({
  settings,
  telemetryRef,
}) {
  const settingsRef = useRef(settings);
  const stateRef = useRef(SCROLL_INERTIA_STATES.IDLE);
  const lastScrollYRef = useRef(0);
  const directionRef = useRef(0);
  const gestureDistanceRef = useRef(0);
  const humanIntentUntilRef = useRef(0);
  const endTimeoutRef = useRef(null);
  const rafRef = useRef(null);
  const tailStartYRef = useRef(null);
  const tailTargetYRef = useRef(null);
  const actualTailDistanceRef = useRef(0);
  const tailStartedAtRef = useRef(0);
  const lastHudWriteAtRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const programmaticSettlingRef = useRef(false);
  const cancelAllRef = useRef(() => {});
  const originalInlineScrollBehaviorRef = useRef(null);
  const scrollBehaviorWasChangedRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;

    if (!settings.enabled || reducedMotionRef.current) {
      cancelAllRef.current();
    }
  }, [settings]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyReducedMotion = () => {
      reducedMotionRef.current = mediaQuery.matches;

      if (reducedMotionRef.current) {
        cancelTail();
        resetSession();
      }

      writeTelemetry(true);
    };

    const markHumanIntent = () => {
      if (stateRef.current === SCROLL_INERTIA_STATES.INERTIA_SETTLING) {
        cancelTail();
        resetSession(SCROLL_INERTIA_STATES.USER_SCROLLING);
      }

      humanIntentUntilRef.current = performance.now() + INTENT_WINDOW_MS;
    };

    const onKeyDown = (event) => {
      const scrollKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
        "Spacebar",
      ]);

      if (!scrollKeys.has(event.key) || isEditableTarget(event.target)) {
        return;
      }

      markHumanIntent();
    };

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (programmaticSettlingRef.current) {
        lastScrollYRef.current = currentScrollY;
        writeTelemetry();
        return;
      }

      const deltaY = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (deltaY === 0) {
        writeTelemetry();
        return;
      }

      if (performance.now() > humanIntentUntilRef.current) {
        writeTelemetry();
        return;
      }

      stateRef.current = SCROLL_INERTIA_STATES.USER_SCROLLING;
      directionRef.current = Math.sign(deltaY);
      gestureDistanceRef.current += Math.abs(deltaY);
      scheduleScrollEnd();
      writeTelemetry();
    };

    const scheduleScrollEnd = () => {
      clearEndTimeout();

      endTimeoutRef.current = window.setTimeout(() => {
        maybeStartTail();
      }, settingsRef.current.scrollEndDelayMs);
    };

    const maybeStartTail = () => {
      const currentSettings = settingsRef.current;

      if (
        !currentSettings.enabled ||
        reducedMotionRef.current ||
        stateRef.current !== SCROLL_INERTIA_STATES.USER_SCROLLING ||
        gestureDistanceRef.current < currentSettings.minGestureDistancePx ||
        directionRef.current === 0
      ) {
        resetSession();
        writeTelemetry(true);
        return;
      }

      const startScrollY = window.scrollY;
      const targetScrollY = clamp(
        startScrollY + directionRef.current * currentSettings.distancePx,
        0,
        getMaxScrollY()
      );
      const effectiveDistance = targetScrollY - startScrollY;

      if (Math.abs(effectiveDistance) <= currentSettings.boundaryEpsilonPx) {
        resetSession();
        writeTelemetry(true);
        return;
      }

      stateRef.current = SCROLL_INERTIA_STATES.INERTIA_SETTLING;
      tailStartYRef.current = startScrollY;
      tailTargetYRef.current = targetScrollY;
      actualTailDistanceRef.current = effectiveDistance;
      tailStartedAtRef.current = performance.now();
      programmaticSettlingRef.current = true;
      prepareImmediateScrollBehavior();
      rafRef.current = window.requestAnimationFrame(runTailFrame);
      writeTelemetry(true);
    };

    const runTailFrame = (timestamp) => {
      const currentSettings = settingsRef.current;

      if (stateRef.current !== SCROLL_INERTIA_STATES.INERTIA_SETTLING) {
        return;
      }

      const startScrollY = tailStartYRef.current ?? window.scrollY;
      const targetScrollY = tailTargetYRef.current ?? startScrollY;
      const elapsed = timestamp - tailStartedAtRef.current;
      const progress = clamp(elapsed / currentSettings.durationMs, 0, 1);
      const easedProgress = easeOutCubic(progress);
      const nextScrollY =
        startScrollY + (targetScrollY - startScrollY) * easedProgress;

      window.scrollTo({ top: nextScrollY, left: 0, behavior: "auto" });
      writeTelemetry();

      if (
        progress >= 1 ||
        Math.abs(window.scrollY - targetScrollY) <=
          currentSettings.boundaryEpsilonPx
      ) {
        completeTail(targetScrollY);
        return;
      }

      rafRef.current = window.requestAnimationFrame(runTailFrame);
    };

    const completeTail = (targetScrollY) => {
      cancelRaf();
      window.scrollTo({ top: targetScrollY, left: 0, behavior: "auto" });
      lastScrollYRef.current = window.scrollY;
      restoreScrollBehavior();
      window.requestAnimationFrame(() => {
        programmaticSettlingRef.current = false;
        resetSession();
        writeTelemetry(true);
      });
    };

    const onResizeLikeEvent = () => {
      cancelTail();
      clearEndTimeout();
      lastScrollYRef.current = window.scrollY;
      resetSession();
      writeTelemetry(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onResizeLikeEvent();
      }
    };

    const clearEndTimeout = () => {
      if (endTimeoutRef.current !== null) {
        window.clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = null;
      }
    };

    const cancelRaf = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    function cancelTail() {
      cancelRaf();
      clearEndTimeout();
      restoreScrollBehavior();
      programmaticSettlingRef.current = false;
      tailStartYRef.current = null;
      tailTargetYRef.current = null;
      actualTailDistanceRef.current = 0;
    }

    function resetSession(nextState = SCROLL_INERTIA_STATES.IDLE) {
      stateRef.current = nextState;
      directionRef.current = 0;
      gestureDistanceRef.current = 0;
      humanIntentUntilRef.current = 0;
      clearEndTimeout();
    }

    function prepareImmediateScrollBehavior() {
      const element = getScrollBehaviorElement();
      const computedBehavior = window.getComputedStyle(element).scrollBehavior;

      if (computedBehavior !== "smooth") {
        return;
      }

      originalInlineScrollBehaviorRef.current = element.style.scrollBehavior;
      element.style.scrollBehavior = "auto";
      scrollBehaviorWasChangedRef.current = true;
    }

    function restoreScrollBehavior() {
      if (!scrollBehaviorWasChangedRef.current) {
        return;
      }

      const element = getScrollBehaviorElement();
      element.style.scrollBehavior =
        originalInlineScrollBehaviorRef.current ?? "";
      scrollBehaviorWasChangedRef.current = false;
      originalInlineScrollBehaviorRef.current = null;
    }

    function writeTelemetry(force = false) {
      const now = performance.now();

      if (!force && now - lastHudWriteAtRef.current < HUD_UPDATE_INTERVAL_MS) {
        return;
      }

      lastHudWriteAtRef.current = now;
      const nodes = telemetryRef.current?.nodes ?? {};
      const currentSettings = settingsRef.current;
      const values = {
        mode: currentSettings.enabled ? "INERTIA" : "NATIVE",
        state: stateRef.current,
        scrollY: window.scrollY.toFixed(1),
        direction:
          directionRef.current > 0
            ? "DOWN"
            : directionRef.current < 0
              ? "UP"
              : "NONE",
        gestureDistance: gestureDistanceRef.current.toFixed(1),
        tailStartY:
          tailStartYRef.current === null
            ? "—"
            : tailStartYRef.current.toFixed(1),
        tailTargetY:
          tailTargetYRef.current === null
            ? "—"
            : tailTargetYRef.current.toFixed(1),
        configuredDistance: `${currentSettings.distancePx}px`,
        actualTailDistance: actualTailDistanceRef.current.toFixed(1),
        duration: `${currentSettings.durationMs}ms`,
        endDelay: `${currentSettings.scrollEndDelayMs}ms`,
        minGestureDistance: `${currentSettings.minGestureDistancePx}px`,
        reducedMotion: reducedMotionRef.current ? "REDUCE" : "NO-PREFERENCE",
      };

      Object.entries(values).forEach(([key, value]) => {
        if (nodes[key]) {
          nodes[key].textContent = value;
        }
      });
    }

    cancelAllRef.current = () => {
      cancelTail();
      resetSession();
      writeTelemetry(true);
    };

    applyReducedMotion();

    window.addEventListener("wheel", markHumanIntent, { passive: true });
    window.addEventListener("touchstart", markHumanIntent, { passive: true });
    window.addEventListener("touchmove", markHumanIntent, { passive: true });
    window.addEventListener("pointerdown", markHumanIntent, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResizeLikeEvent, { passive: true });
    window.addEventListener("orientationchange", onResizeLikeEvent, {
      passive: true,
    });
    document.addEventListener("visibilitychange", onVisibilityChange);
    mediaQuery.addEventListener("change", applyReducedMotion);

    return () => {
      window.removeEventListener("wheel", markHumanIntent);
      window.removeEventListener("touchstart", markHumanIntent);
      window.removeEventListener("touchmove", markHumanIntent);
      window.removeEventListener("pointerdown", markHumanIntent);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResizeLikeEvent);
      window.removeEventListener("orientationchange", onResizeLikeEvent);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mediaQuery.removeEventListener("change", applyReducedMotion);
      cancelTail();
      clearEndTimeout();
      cancelAllRef.current = () => {};
    };
  }, [telemetryRef]);

  return null;
}
