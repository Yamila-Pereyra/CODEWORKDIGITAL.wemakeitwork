"use client";

import { useState } from "react";

import styles from "./GlobalScrollInertiaLab.module.css";

const CONTROL_RANGES = Object.freeze({
  distancePx: { min: 0, max: 80, step: 1, label: "Distance" },
  durationMs: { min: 100, max: 700, step: 10, label: "Duration" },
  scrollEndDelayMs: { min: 0, max: 180, step: 4, label: "Scroll-end delay" },
  minGestureDistancePx: {
    min: 0,
    max: 60,
    step: 1,
    label: "Minimum gesture distance",
  },
});

const METRICS = [
  ["mode", "MODE"],
  ["state", "STATE"],
  ["scrollY", "SCROLL Y"],
  ["direction", "DIRECTION"],
  ["gestureDistance", "GESTURE DISTANCE"],
  ["tailStartY", "TAIL START Y"],
  ["tailTargetY", "TAIL TARGET Y"],
  ["configuredDistance", "CONFIGURED DISTANCE"],
  ["actualTailDistance", "ACTUAL TAIL DISTANCE"],
  ["duration", "DURATION"],
  ["endDelay", "END DELAY"],
  ["minGestureDistance", "MIN GESTURE DISTANCE"],
  ["reducedMotion", "REDUCED MOTION"],
];

const clampNumber = (value, min, max) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return min;
  }

  return Math.min(Math.max(parsed, min), max);
};

export default function GlobalScrollInertiaHud({
  settings,
  onSettingsChange,
  telemetryRef,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const setNode = (key) => (node) => {
    if (!telemetryRef.current.nodes) {
      telemetryRef.current.nodes = {};
    }

    if (node) {
      telemetryRef.current.nodes[key] = node;
    }
  };

  const updateSetting = (key, value) => {
    const range = CONTROL_RANGES[key];
    const nextValue = clampNumber(value, range.min, range.max);

    onSettingsChange((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

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
                <output ref={setNode(key)}>—</output>
              </div>
            ))}
          </div>

          <fieldset className={styles.controlGroup}>
            <legend>Compare mode</legend>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) =>
                  onSettingsChange((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
              />
              <span>{settings.enabled ? "INERTIA" : "NATIVE"}</span>
            </label>
          </fieldset>

          {Object.entries(CONTROL_RANGES).map(([key, range]) => (
            <div className={styles.controlRow} key={key}>
              <label htmlFor={`scroll-inertia-${key}`}>
                {range.label}
              </label>
              <div className={styles.controlInputs}>
                <input
                  id={`scroll-inertia-${key}`}
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={settings[key]}
                  onChange={(event) => updateSetting(key, event.target.value)}
                />
                <input
                  type="number"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={settings[key]}
                  onChange={(event) => updateSetting(key, event.target.value)}
                  aria-label={`${range.label} numeric value`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
