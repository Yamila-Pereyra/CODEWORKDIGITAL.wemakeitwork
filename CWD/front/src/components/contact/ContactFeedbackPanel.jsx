"use client";

import { useEffect, useState } from "react";

const TYPEWRITER_START_DELAY_MS = 260;
const TYPEWRITER_CHARACTER_DELAY_MS = 22;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);

      return () => {
        mediaQuery.removeEventListener("change", updatePreference);
      };
    }

    mediaQuery.addListener(updatePreference);

    return () => {
      mediaQuery.removeListener(updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

export default function ContactFeedbackPanel({
  tone = "success",
  title,
  detail = "",
  animationKey,
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimateDetail =
    tone === "success" && Boolean(detail) && !prefersReducedMotion;
  const [visibleDetail, setVisibleDetail] = useState(
    shouldAnimateDetail ? "" : detail
  );

  useEffect(() => {
    if (!shouldAnimateDetail) {
      setVisibleDetail(detail);
      return undefined;
    }

    setVisibleDetail("");

    let cancelled = false;
    let revealTimeoutId = null;

    const startTimeoutId = window.setTimeout(() => {
      const revealNextCharacter = (nextIndex) => {
        if (cancelled) {
          return;
        }

        setVisibleDetail(detail.slice(0, nextIndex));

        if (nextIndex >= detail.length) {
          return;
        }

        revealTimeoutId = window.setTimeout(() => {
          revealNextCharacter(nextIndex + 1);
        }, TYPEWRITER_CHARACTER_DELAY_MS);
      };

      revealNextCharacter(1);
    }, TYPEWRITER_START_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimeoutId);

      if (revealTimeoutId !== null) {
        window.clearTimeout(revealTimeoutId);
      }
    };
  }, [animationKey, detail, shouldAnimateDetail]);

  return (
    <div
      className={`contacto-feedback-panel contacto-feedback-panel--${tone}`}
      aria-hidden="true"
    >
      <p className="contacto-feedback-title">{title}</p>
      {detail ? (
        <p className="contacto-feedback-detail">
          {shouldAnimateDetail ? visibleDetail : detail}
        </p>
      ) : null}
    </div>
  );
}
