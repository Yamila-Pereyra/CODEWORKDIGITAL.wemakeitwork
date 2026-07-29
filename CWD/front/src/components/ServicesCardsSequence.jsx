"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

const CARD_SEQUENCE_CONFIG = Object.freeze({
  durationMs: 1000,
  staggerMs: 280,
  startTranslateY: "33%",
  easing: "cubic-bezier(.22, .61, .36, 1)",
  activationRootMargin: "0px 0px -24% 0px",
  resetRootMargin: "0px",
});

const VISUALS = {
  "01": WebVisual,
  "02": CommerceVisual,
  "03": AppsVisual,
  "04": OptimizationVisual,
  "05": AnalyticsVisual,
};

function ServiceCardSvg({ children }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className="services-sequence-card-svg"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function WebVisual() {
  return (
    <ServiceCardSvg>
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
    </ServiceCardSvg>
  );
}

function CommerceVisual() {
  return (
    <ServiceCardSvg>
      <rect className="services-visual-block" x="54" y="48" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="132" y="48" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="210" y="48" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="54" y="120" width="58" height="48" rx="12" />
      <rect className="services-visual-block" x="132" y="120" width="58" height="48" rx="12" />
      <path className="accent services-visual-accent" d="M88 184C122 198 188 198 232 168" />
      <path className="accent services-visual-path" d="M216 166L234 166L228 183" />
      <circle className="node services-visual-node is-primary" cx="238" cy="142" r="14" />
      <path className="services-visual-path" d="M229 142H247M238 133V151" />
    </ServiceCardSvg>
  );
}

function AppsVisual() {
  return (
    <ServiceCardSvg>
      <rect className="services-visual-frame" x="54" y="44" width="92" height="132" rx="18" />
      <rect className="services-visual-frame" x="186" y="32" width="76" height="156" rx="20" />
      <path className="services-visual-block" d="M78 78H122M78 104H116M78 132H128" />
      <path className="services-visual-block" d="M208 76H240M208 108H236M208 140H242" />
      <path className="accent services-visual-accent" d="M146 108C164 84 174 84 186 108" />
      <path className="accent services-visual-accent" d="M146 138C164 164 174 164 186 138" />
      <circle className="node services-visual-node" cx="166" cy="96" r="7" />
      <circle className="node services-visual-node is-primary" cx="166" cy="150" r="7" />
    </ServiceCardSvg>
  );
}

function OptimizationVisual() {
  return (
    <ServiceCardSvg>
      <path className="services-visual-path" d="M52 164H268" />
      <path className="accent services-visual-accent" d="M70 148C102 144 116 120 142 118C176 115 180 84 212 82C234 80 248 62 266 48" />
      <path className="accent services-visual-path" d="M248 49L267 47L262 66" />
      <circle className="node services-visual-node" cx="142" cy="118" r="8" />
      <circle className="node services-visual-node is-primary" cx="212" cy="82" r="8" />
      <path className="services-visual-block" d="M74 132V164M116 108V164M158 92V164M200 72V164M242 56V164" opacity=".45" />
    </ServiceCardSvg>
  );
}

function AnalyticsVisual() {
  return (
    <ServiceCardSvg>
      <path className="services-visual-path" d="M62 170H262" />
      <rect className="services-visual-block" x="76" y="118" width="28" height="52" rx="6" />
      <rect className="services-visual-block" x="124" y="88" width="28" height="82" rx="6" />
      <rect className="services-visual-block" x="172" y="106" width="28" height="64" rx="6" />
      <rect className="node services-visual-block is-primary" x="220" y="62" width="28" height="108" rx="6" />
      <path className="accent services-visual-accent" d="M90 96L138 70L186 82L234 46" />
      <circle className="node services-visual-node" cx="138" cy="70" r="7" />
      <circle className="node services-visual-node is-primary" cx="234" cy="46" r="9" />
    </ServiceCardSvg>
  );
}

function getDirection(entry, previousTopRef) {
  const currentTop = entry.boundingClientRect.top;
  const previousTop = previousTopRef.current;

  previousTopRef.current = currentTop;

  if (previousTop === null) {
    return null;
  }

  if (currentTop < previousTop) {
    return "down";
  }

  if (currentTop > previousTop) {
    return "up";
  }

  return null;
}

export default function ServicesCardsSequence({ items }) {
  const sequenceTriggerRef = useRef(null);
  const activationObserverRef = useRef(null);
  const resetObserverRef = useRef(null);
  const activationPreviousTopRef = useRef(null);
  const resetPreviousTopRef = useRef(null);
  const resetAfterCompleteRef = useRef(false);
  const sequenceStateRef = useRef("complete");
  const [sequenceState, setSequenceState] = useState("complete");
  const [isSequenceReady, setIsSequenceReady] = useState(false);

  const transitionSequenceState = useCallback((nextState) => {
    if (sequenceStateRef.current === nextState) {
      return;
    }

    sequenceStateRef.current = nextState;
    setSequenceState(nextState);
  }, []);

  const sequenceVariables = {
    "--service-card-duration": `${CARD_SEQUENCE_CONFIG.durationMs}ms`,
    "--service-card-stagger": `${CARD_SEQUENCE_CONFIG.staggerMs}ms`,
    "--service-card-start-y": CARD_SEQUENCE_CONFIG.startTranslateY,
    "--service-card-easing": CARD_SEQUENCE_CONFIG.easing,
  };

  const handleCardAnimationEnd = (event, index) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (index !== items.length - 1) {
      return;
    }

    if (sequenceStateRef.current !== "playing") {
      return;
    }

    const animationName = event.animationName || "";
    const isMaterialize =
      animationName === "serviceCardMaterialize" ||
      animationName.endsWith("serviceCardMaterialize");

    if (!isMaterialize && animationName !== "") {
      return;
    }

    const triggerTop = sequenceTriggerRef.current?.getBoundingClientRect().top;
    const triggerIsBelowViewport =
      typeof triggerTop === "number" && triggerTop >= window.innerHeight;
    const shouldRearm =
      resetAfterCompleteRef.current && triggerIsBelowViewport;

    resetAfterCompleteRef.current = false;
    transitionSequenceState(shouldRearm ? "armed" : "complete");
  };

  useLayoutEffect(() => {
    const trigger = sequenceTriggerRef.current;

    if (items.length === 0 || !trigger) {
      resetAfterCompleteRef.current = false;
      transitionSequenceState("complete");
      setIsSequenceReady(true);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      resetAfterCompleteRef.current = false;
      transitionSequenceState("complete");
      setIsSequenceReady(true);
      return undefined;
    }

    const triggerTop = trigger.getBoundingClientRect().top;
    const initialState = triggerTop > window.innerHeight ? "armed" : "complete";

    transitionSequenceState(initialState);
    resetAfterCompleteRef.current = false;
    activationPreviousTopRef.current = triggerTop;
    resetPreviousTopRef.current = triggerTop;

    try {
      const activationObserver = new IntersectionObserver(
        ([entry]) => {
          const direction = getDirection(entry, activationPreviousTopRef);
          const currentState = sequenceStateRef.current;
          const crossedDownward =
            direction === "down" &&
            (entry.isIntersecting ||
              (entry.rootBounds &&
                entry.boundingClientRect.bottom <= entry.rootBounds.top));
          const movingUpIntoOrPastRoot =
            direction === "up" &&
            (entry.isIntersecting ||
              (entry.rootBounds &&
                entry.boundingClientRect.top >= entry.rootBounds.bottom));

          if (direction === "down" && entry.boundingClientRect.top < window.innerHeight) {
            resetAfterCompleteRef.current = false;
          }

          if (crossedDownward && currentState === "armed") {
            resetAfterCompleteRef.current = false;
            transitionSequenceState("playing");
            return;
          }

          if (movingUpIntoOrPastRoot && currentState === "armed") {
            if (entry.boundingClientRect.top < window.innerHeight) {
              resetAfterCompleteRef.current = false;
              transitionSequenceState("complete");
            } else {
              transitionSequenceState("armed");
            }
          }

          if (
            direction === "up" &&
            currentState === "complete" &&
            entry.boundingClientRect.top >= window.innerHeight
          ) {
            resetAfterCompleteRef.current = false;
            transitionSequenceState("armed");
          }
        },
        {
          threshold: 0,
          rootMargin: CARD_SEQUENCE_CONFIG.activationRootMargin,
        }
      );

      const resetObserver = new IntersectionObserver(
        ([entry]) => {
          const direction = getDirection(entry, resetPreviousTopRef);
          const currentState = sequenceStateRef.current;
          const exitedBelow =
            direction === "up" &&
            !entry.isIntersecting &&
            entry.rootBounds &&
            entry.boundingClientRect.top >= entry.rootBounds.bottom;

          if (direction === "down" && entry.boundingClientRect.top < window.innerHeight) {
            resetAfterCompleteRef.current = false;
          }

          if (!exitedBelow) {
            return;
          }

          if (currentState === "complete") {
            resetAfterCompleteRef.current = false;
            transitionSequenceState("armed");
            return;
          }

          if (currentState === "playing") {
            resetAfterCompleteRef.current = true;
          }
        },
        {
          threshold: 0,
          rootMargin: CARD_SEQUENCE_CONFIG.resetRootMargin,
        }
      );

      activationObserverRef.current = activationObserver;
      resetObserverRef.current = resetObserver;
      activationObserver.observe(trigger);
      resetObserver.observe(trigger);
      setIsSequenceReady(true);
    } catch {
      activationObserverRef.current?.disconnect();
      resetObserverRef.current?.disconnect();
      activationObserverRef.current = null;
      resetObserverRef.current = null;
      resetAfterCompleteRef.current = false;
      transitionSequenceState("complete");
      setIsSequenceReady(true);
    }

    return () => {
      activationObserverRef.current?.disconnect();
      resetObserverRef.current?.disconnect();
      activationObserverRef.current = null;
      resetObserverRef.current = null;
      resetAfterCompleteRef.current = false;
    };
  }, [items.length, transitionSequenceState]);

  return (
    <>
      <div
        ref={sequenceTriggerRef}
        className="services-cards-sequence-trigger"
        aria-hidden="true"
      />

      <div
        className="services-cards-grid"
        data-sequence-state={sequenceState}
        data-sequence-ready={isSequenceReady ? "true" : "false"}
        style={sequenceVariables}
      >
        {items.map((item, index) => {
          const Visual = VISUALS[item.numero] || AnalyticsVisual;

          return (
            <article
              className="services-sequence-card"
              key={item.numero}
              style={{ "--service-card-index": index }}
              onAnimationEnd={(event) => handleCardAnimationEnd(event, index)}
            >
              <div className="services-sequence-card-surface">
                <div className="services-sequence-card-visual" aria-hidden="true">
                  <Visual />
                </div>

                <span className="services-sequence-card-number">
                  {item.numero}
                </span>

                <h3 className="services-sequence-card-title">
                  {item.titulo}
                </h3>

                <p className="services-sequence-card-copy">
                  {item.texto}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
