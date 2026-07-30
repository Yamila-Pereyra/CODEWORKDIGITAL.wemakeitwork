"use client";

import { useEffect, useState } from "react";

import { LENIS_LAB_DEFAULTS } from "./GlobalScrollInertiaController";
import styles from "./GlobalScrollInertiaLab.module.css";

const CONTROL_RANGES = Object.freeze({
  lerp: { min: 0.05, max: 0.3, step: 0.01, label: "Lerp" },
  wheelMultiplier: {
    min: 0.5,
    max: 1.5,
    step: 0.05,
    label: "Wheel multiplier",
  },
});

const METRICS = [
  ["mode", "MODE"],
  ["reducedMotion", "REDUCED MOTION"],
  ["actualScroll", "ACTUAL SCROLL"],
  ["animatedScroll", "ANIMATED SCROLL"],
  ["targetScroll", "TARGET SCROLL"],
  ["remainingDistance", "REMAINING DISTANCE"],
  ["velocity", "VELOCITY"],
  ["lastVelocity", "LAST VELOCITY"],
  ["direction", "DIRECTION"],
  ["isScrolling", "IS SCROLLING"],
  ["progress", "PROGRESS"],
  ["limit", "LIMIT"],
  ["lerp", "LERP"],
  ["wheelMultiplier", "WHEEL MULTIPLIER"],
  ["smoothWheel", "SMOOTH WHEEL"],
];

const clampNumber = (value, min, max) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return min;
  }

  return Math.min(Math.max(parsed, min), max);
};

const formatControlValue = (key, value) =>
  key === "lerp" || key === "wheelMultiplier"
    ? Number(value).toFixed(2)
    : String(value);

export default function GlobalScrollInertiaHud({
  settings,
  onSettingsChange,
  telemetryRef,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [draftValues, setDraftValues] = useState({
    lerp: settings.lerp,
    wheelMultiplier: settings.wheelMultiplier,
  });

  useEffect(() => {
    setDraftValues({
      lerp: settings.lerp,
      wheelMultiplier: settings.wheelMultiplier,
    });
  }, [settings.lerp, settings.wheelMultiplier]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyReducedMotion = () => setReducedMotion(mediaQuery.matches);

    applyReducedMotion();
    mediaQuery.addEventListener("change", applyReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", applyReducedMotion);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      commitNumericSetting("lerp", draftValues.lerp);
      commitNumericSetting("wheelMultiplier", draftValues.wheelMultiplier);
    }, 140);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftValues.lerp, draftValues.wheelMultiplier]);

  const setNode = (key) => (node) => {
    if (!telemetryRef.current.nodes) {
      telemetryRef.current.nodes = {};
    }

    if (node) {
      telemetryRef.current.nodes[key] = node;
    }
  };

  const patchSettings = (patch) => {
    onSettingsChange((current) => {
      const next = { ...current, ...patch };

      return Object.keys(patch).every((key) => current[key] === next[key])
        ? current
        : next;
    });
  };

  const commitNumericSetting = (key, rawValue) => {
    const range = CONTROL_RANGES[key];
    const nextValue = clampNumber(rawValue, range.min, range.max);

    patchSettings({ [key]: nextValue });
  };

  const flushNumericSetting = (key) => {
    commitNumericSetting(key, draftValues[key]);
  };

  const updateDraftValue = (key, rawValue) => {
    const range = CONTROL_RANGES[key];
    const nextValue = clampNumber(rawValue, range.min, range.max);

    setDraftValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

  const lenisControlsDisabled = reducedMotion;

  return (
    <aside
      className={`${styles.hud} ${collapsed ? styles.hudCollapsed : ""}`}
      data-scroll-inertia-controls
      aria-label="Global scroll inertia controls"
    >
      <div className={styles.hudHeader}>
        <p>Scroll inertia lab</p>
        <button
          type="button"
          className={styles.hudToggle}
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          {collapsed ? "Open" : "Close"}
        </button>
      </div>

      {!collapsed && (
        <div className={styles.hudBody}>
          <div className={styles.metricGrid} aria-label="Scroll metrics">
            {METRICS.map(([key, label]) => (
              <div className={styles.metricRow} key={key}>
                <span>{label}</span>
                <output ref={setNode(key)}>--</output>
              </div>
            ))}
          </div>

          {reducedMotion && (
            <p className={styles.hudNotice}>
              Reduced motion is active. Effective mode stays native.
            </p>
          )}

          <fieldset className={styles.controlGroup}>
            <legend>Mode</legend>
            <div className={styles.modeOptions}>
              <label className={styles.radioRow}>
                <input
                  type="radio"
                  name="scroll-inertia-mode"
                  checked={!settings.enabled}
                  onChange={() => patchSettings({ enabled: false })}
                />
                <span>NATIVE</span>
              </label>

              <label className={styles.radioRow}>
                <input
                  type="radio"
                  name="scroll-inertia-mode"
                  checked={settings.enabled}
                  onChange={() => patchSettings({ enabled: true })}
                />
                <span>LENIS</span>
              </label>
            </div>
          </fieldset>

          {Object.entries(CONTROL_RANGES).map(([key, range]) => (
            <div className={styles.controlRow} key={key}>
              <label htmlFor={`scroll-inertia-${key}`}>{range.label}</label>
              <div className={styles.controlInputs}>
                <input
                  id={`scroll-inertia-${key}`}
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={draftValues[key]}
                  disabled={lenisControlsDisabled}
                  onChange={(event) => updateDraftValue(key, event.target.value)}
                  onPointerUp={() => flushNumericSetting(key)}
                  onKeyUp={() => flushNumericSetting(key)}
                  onBlur={() => flushNumericSetting(key)}
                />
                <output className={styles.controlValue}>
                  {formatControlValue(key, draftValues[key])}
                </output>
              </div>
            </div>
          ))}

          <fieldset className={styles.controlGroup} disabled={lenisControlsDisabled}>
            <legend>Smooth wheel</legend>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={settings.smoothWheel}
                onChange={(event) =>
                  patchSettings({ smoothWheel: event.target.checked })
                }
              />
              <span>{settings.smoothWheel ? "TRUE" : "FALSE"}</span>
            </label>
          </fieldset>

          <button
            type="button"
            className={styles.resetButton}
            disabled={lenisControlsDisabled}
            onClick={() =>
              patchSettings({
                lerp: LENIS_LAB_DEFAULTS.lerp,
                wheelMultiplier: LENIS_LAB_DEFAULTS.wheelMultiplier,
                smoothWheel: LENIS_LAB_DEFAULTS.smoothWheel,
              })
            }
          >
            Reset
          </button>
        </div>
      )}
    </aside>
  );
}
