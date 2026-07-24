"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const VISUALS = {
  "01": WebVisual,
  "02": CommerceVisual,
  "03": AppsVisual,
  "04": OptimizationVisual,
  "05": AnalyticsVisual,
};

function RailSvg({ children }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className="services-rail-svg"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function WebVisual() {
  return (
    <RailSvg>
      <rect className="services-visual-frame" x="44" y="42" width="232" height="136" rx="18" />
      <path className="services-visual-path" d="M44 78H276" />
      <path className="services-visual-block" d="M78 112H146M78 140H124M168 112H226M148 140H242" />
      <circle className="services-visual-node" cx="74" cy="60" r="5" />
      <circle className="services-visual-node" cx="94" cy="60" r="5" />
      <circle className="services-visual-node" cx="114" cy="60" r="5" />
      <path className="accent services-visual-accent" d="M88 178L132 138L184 158L232 104" />
      <circle className="node services-visual-node" cx="132" cy="138" r="7" />
      <circle className="node services-visual-node" cx="184" cy="158" r="7" />
      <circle className="node services-visual-node is-primary" cx="232" cy="104" r="7" />
    </RailSvg>
  );
}

function CommerceVisual() {
  return (
    <RailSvg>
      <rect className="services-visual-block" x="54" y="48" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="132" y="48" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="210" y="48" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="54" y="120" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="132" y="120" width="58" height="48" rx="12" />
      <path className="accent services-visual-accent" d="M88 184C122 198 188 198 232 168" />
      <path className="accent services-visual-path" d="M216 166L234 166L228 183" />
      <circle className="node services-visual-node is-primary" cx="238" cy="142" r="14" />
      <path className="services-visual-path" d="M229 142H247M238 133V151" />
    </RailSvg>
  );
}

function AppsVisual() {
  return (
    <RailSvg>
      <rect className="services-visual-frame" x="54" y="44" width="92" height="132" rx="18" />
      <rect className="services-visual-frame" x="186" y="32" width="76" height="156" rx="20" />
      <path className="services-visual-block" d="M78 78H122M78 104H116M78 132H128" />
      <path className="services-visual-block" d="M208 76H240M208 108H236M208 140H242" />
      <path className="accent services-visual-accent" d="M146 108C164 84 174 84 186 108" />
      <path className="accent services-visual-accent" d="M146 138C164 164 174 164 186 138" />
      <circle className="node services-visual-node" cx="166" cy="96" r="7" />
      <circle className="node services-visual-node is-primary" cx="166" cy="150" r="7" />
    </RailSvg>
  );
}

function OptimizationVisual() {
  return (
    <RailSvg>
      <path className="services-visual-path" d="M52 164H268" />
      <path className="accent services-visual-accent" d="M70 148C102 144 116 120 142 118C176 115 180 84 212 82C234 80 248 62 266 48" />
      <path className="accent services-visual-path" d="M248 49L267 47L262 66" />
      <circle className="node services-visual-node" cx="142" cy="118" r="8" />
      <circle className="node services-visual-node is-primary" cx="212" cy="82" r="8" />
      <path className="services-visual-block" d="M74 132V164M116 108V164M158 92V164M200 72V164M242 56V164" opacity=".45" />
    </RailSvg>
  );
}

function AnalyticsVisual() {
  return (
    <RailSvg>
      <path className="services-visual-path" d="M62 170H262" />
      <rect className="services-visual-block" x="76" y="118" width="28" height="52" rx="6" />
      <rect className="services-visual-block" x="124" y="88" width="28" height="82" rx="6" />
      <rect className="services-visual-block" x="172" y="106" width="28" height="64" rx="6" />
      <rect className="node services-visual-block is-primary" x="220" y="62" width="28" height="108" rx="6" />
      <path className="accent services-visual-accent" d="M90 96L138 70L186 82L234 46" />
      <circle className="node services-visual-node" cx="138" cy="70" r="7" />
      <circle className="node services-visual-node is-primary" cx="234" cy="46" r="9" />
    </RailSvg>
  );
}

export default function ServicesEditorialRail({ items, watermark }) {
  const railId = useId();
  const railRef = useRef(null);
  const resetSentinelRef = useRef(null);
  const rowRefs = useRef([]);
  const rowObserverRef = useRef(null);
  const resetObserverRef = useRef(null);
  const pendingRowsRef = useRef(new Set());
  const revealedIndicesRef = useRef(new Set());
  const sentinelPassedAboveRef = useRef(false);
  const deferredResetRef = useRef(false);
  const awaitingRowRearmRef = useRef(false);
  const sentinelReturnedBelowRef = useRef(false);
  const normalizedRailId = railId.replace(/:/g, "");
  const [openIndex, setOpenIndex] = useState(null);
  const [isMotionReady, setIsMotionReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isRowRevealReady, setIsRowRevealReady] = useState(false);
  const [isRowCycleArmed, setIsRowCycleArmed] = useState(true);
  const [revealCycle, setRevealCycle] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState(() => new Set());

  const getTriggerId = (numero) =>
    `services-${normalizedRailId}-${numero}-trigger`;
  const getPanelId = (numero) =>
    `services-${normalizedRailId}-${numero}-panel`;

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const handleTriggerKeyDown = (event, index) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleToggle(index);
  };

  const commitRowReveal = (index, row, delay = "0ms") => {
    if (!row) {
      return;
    }

    row.style.setProperty("--row-delay", delay);
    rowObserverRef.current?.unobserve(row);
    pendingRowsRef.current.delete(row);

    setRevealedIndices((current) => {
      if (current.has(index)) {
        return current;
      }

      const next = new Set(current);
      next.add(index);
      revealedIndicesRef.current = next;
      return next;
    });

    if (pendingRowsRef.current.size === 0) {
      rowObserverRef.current?.disconnect();
      rowObserverRef.current = null;
    }
  };

  const revealRowFromFocus = (index) => {
    commitRowReveal(index, rowRefs.current[index], "0ms");
  };

  const resetRowRevealCycle = () => {
    rowObserverRef.current?.disconnect();
    rowObserverRef.current = null;
    sentinelPassedAboveRef.current = false;
    deferredResetRef.current = false;
    awaitingRowRearmRef.current = true;
    sentinelReturnedBelowRef.current = false;
    setOpenIndex(null);
    revealedIndicesRef.current = new Set();
    setRevealedIndices(new Set());

    rowRefs.current.forEach((row) => {
      row?.style.removeProperty("--row-delay");
    });

    pendingRowsRef.current = new Set();
    setIsRowCycleArmed(false);
    setRevealCycle((cycle) => cycle + 1);
  };

  const requestRowRevealReset = () => {
    if (revealedIndicesRef.current.size === 0) {
      return;
    }

    if (railRef.current?.contains(document.activeElement)) {
      deferredResetRef.current = true;
      return;
    }

    resetRowRevealCycle();
  };

  const handleRailBlurCapture = (event) => {
    if (
      deferredResetRef.current &&
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      deferredResetRef.current = false;
      resetRowRevealCycle();
    }
  };

  useEffect(() => {
    setIsMotionReady(true);

    const rail = railRef.current;

    if (!rail || typeof IntersectionObserver === "undefined") {
      setHasEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setHasEntered(true);
        observer.disconnect();
      },
      { threshold: 0.16 }
    );

    observer.observe(rail);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = resetSentinelRef.current;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      prefersReducedMotion ||
      !sentinel ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting &&
          entry.rootBounds &&
          entry.boundingClientRect.bottom < entry.rootBounds.top
        ) {
          sentinelPassedAboveRef.current = true;
          return;
        }

        if (
          !entry.isIntersecting &&
          entry.rootBounds &&
          awaitingRowRearmRef.current &&
          entry.boundingClientRect.top > entry.rootBounds.bottom
        ) {
          sentinelReturnedBelowRef.current = true;
          return;
        }

        if (
          entry.isIntersecting &&
          awaitingRowRearmRef.current &&
          sentinelReturnedBelowRef.current &&
          revealedIndicesRef.current.size === 0
        ) {
          awaitingRowRearmRef.current = false;
          sentinelReturnedBelowRef.current = false;
          setIsRowCycleArmed(true);
          return;
        }

        if (
          entry.isIntersecting &&
          sentinelPassedAboveRef.current &&
          revealedIndicesRef.current.size > 0
        ) {
          sentinelPassedAboveRef.current = false;
          requestRowRevealReset();
        }
      },
      {
        threshold: 0,
        rootMargin: "320px 0px 0px 0px",
      }
    );

    resetObserverRef.current = observer;
    observer.observe(sentinel);

    return () => {
      resetObserverRef.current?.disconnect();
      resetObserverRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const rows = rowRefs.current.filter(Boolean);

    if (rows.length === 0) {
      setIsRowRevealReady(true);
      return undefined;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      rows.forEach((row, index) => {
        row.style.setProperty("--row-delay", "0ms");
      });
      const visibleRows = new Set(rows.map((_, index) => index));
      revealedIndicesRef.current = visibleRows;
      setRevealedIndices(visibleRows);
      setIsRowRevealReady(true);
      return undefined;
    }

    if (!isRowCycleArmed) {
      pendingRowsRef.current = new Set(rows);
      setIsRowRevealReady(true);
      return undefined;
    }

    pendingRowsRef.current = new Set(rows);

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Number(left.target.dataset.rowIndex) -
              Number(right.target.dataset.rowIndex)
          );

        entering.forEach((entry, positionInBatch) => {
          const index = Number(entry.target.dataset.rowIndex);
          commitRowReveal(index, entry.target, `${positionInBatch * 70}ms`);
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -120px 0px",
      }
    );

    rowObserverRef.current = observer;
    rows.forEach((row) => observer.observe(row));
    setIsRowRevealReady(true);

    return () => {
      rowObserverRef.current?.disconnect();
      rowObserverRef.current = null;
      pendingRowsRef.current.clear();
    };
  }, [isRowCycleArmed, revealCycle]);

  return (
    <div
      className={`services-editorial-rail ${isMotionReady ? "is-motion-ready" : ""} ${hasEntered ? "is-entered" : ""} ${isRowRevealReady ? "is-row-reveal-ready" : ""}`}
      ref={railRef}
      onBlurCapture={handleRailBlurCapture}
    >
      <div className="services-rail-watermark" aria-hidden="true">
        {watermark}
      </div>

      <div
        className="services-rail-reset-sentinel"
        ref={resetSentinelRef}
        aria-hidden="true"
      />

      <div className="services-rail-list">
        {items.map((item, index) => {
          const isActive = index === openIndex;
          const triggerId = getTriggerId(item.numero);
          const panelId = getPanelId(item.numero);
          const Visual = VISUALS[item.numero] || AnalyticsVisual;
          const isRevealed = revealedIndices.has(index);

          return (
            <article
              className={`services-rail-item ${isActive ? "is-active" : ""} ${isRevealed ? "is-scroll-revealed" : ""}`}
              key={item.numero}
              data-row-index={index}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
            >
              <div className="services-rail-mask">
                <div className="services-rail-inner">
                  <h3 className="services-rail-heading">
                    <button
                      type="button"
                      id={triggerId}
                      aria-expanded={isActive}
                      aria-controls={panelId}
                      className="services-rail-trigger"
                      onClick={() => handleToggle(index)}
                      onFocus={() => revealRowFromFocus(index)}
                      onKeyDown={(event) => handleTriggerKeyDown(event, index)}
                    >
                      <span className="services-rail-number">{item.numero}</span>
                      <span className="services-rail-title">{item.titulo}</span>
                      <span className="services-rail-indicator" aria-hidden="true" />
                    </button>
                  </h3>
                </div>
              </div>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="services-rail-panel"
                hidden={!isActive}
              >
                <p className="services-rail-copy">{item.texto}</p>

                <div className="services-rail-visual">
                  <Visual />
                </div>
              </div>

              <div className="services-rail-tail-mask" aria-hidden="true">
                <div className="services-rail-tail-line" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
