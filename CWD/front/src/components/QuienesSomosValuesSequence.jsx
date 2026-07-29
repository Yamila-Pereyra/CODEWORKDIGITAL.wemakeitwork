"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

const VALUES_SEQUENCE_CONFIG = Object.freeze({
  durationMs: 1000,
  staggerMs: 280,
  startTranslateX: "-33%",
  easing: "cubic-bezier(.22, .61, .36, 1)",
  activationRootMargin: "0px 0px -24% 0px",
  resetRootMargin: "0px",
});

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

export default function QuienesSomosValuesSequence({ items }) {
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
    "--qs-card-duration": `${VALUES_SEQUENCE_CONFIG.durationMs}ms`,
    "--qs-card-stagger": `${VALUES_SEQUENCE_CONFIG.staggerMs}ms`,
    "--qs-card-start-x": VALUES_SEQUENCE_CONFIG.startTranslateX,
    "--qs-card-easing": VALUES_SEQUENCE_CONFIG.easing,
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
      animationName === "qsCardMaterializeHorizontal" ||
      animationName.endsWith("qsCardMaterializeHorizontal");

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
        },
        {
          threshold: 0,
          rootMargin: VALUES_SEQUENCE_CONFIG.activationRootMargin,
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
          rootMargin: VALUES_SEQUENCE_CONFIG.resetRootMargin,
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
        className="qs-values-sequence-trigger"
        aria-hidden="true"
      />

      <div
        className="qs-valores-grid"
        data-sequence-state={sequenceState}
        data-sequence-ready={isSequenceReady ? "true" : "false"}
        style={sequenceVariables}
      >
        {items.map((item, index) => (
          <article
            className="qs-card"
            key={item.numero}
            style={{
              "--qs-card-index": index,
              "--qs-card-stack-index": items.length - index,
            }}
            onAnimationEnd={(event) => handleCardAnimationEnd(event, index)}
          >
            <div className="qs-card-surface">
              <span className="qs-card-number">{item.numero}</span>

              <h3 className="qs-card-title">{item.titulo}</h3>

              <p className="qs-card-copy">{item.texto}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
