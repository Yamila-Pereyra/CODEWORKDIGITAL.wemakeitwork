"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function getTurnstileApi() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.turnstile ?? null;
}

export default function TurnstileWidget({
  siteKey,
  action,
  resetSignal = 0,
  disabled = false,
  className = "",
  onReadyChange,
  onToken,
  onExpire,
  onError,
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const previousResetSignalRef = useRef(resetSignal);
  const callbacksRef = useRef({
    onReadyChange,
    onToken,
    onExpire,
    onError,
  });
  const [scriptReady, setScriptReady] = useState(Boolean(getTurnstileApi()));

  useEffect(() => {
    if (getTurnstileApi()) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    callbacksRef.current = {
      onReadyChange,
      onToken,
      onExpire,
      onError,
    };
  }, [onError, onExpire, onReadyChange, onToken]);

  useEffect(() => {
    const turnstile = getTurnstileApi();

    if (!siteKey || !action || !scriptReady || !turnstile || !containerRef.current) {
      return undefined;
    }

    if (widgetIdRef.current !== null) {
      return undefined;
    }

    const widgetId = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      callback: (token) => {
        callbacksRef.current.onToken?.(token);
      },
      "expired-callback": () => {
        callbacksRef.current.onExpire?.();
      },
      "error-callback": (code) => {
        callbacksRef.current.onError?.(code || "turnstile_error");
      },
    });

    widgetIdRef.current = widgetId;
    callbacksRef.current.onReadyChange?.(true);

    return () => {
      const activeWidgetId = widgetIdRef.current;

      if (activeWidgetId !== null) {
        try {
          turnstile.remove(activeWidgetId);
        } catch {
          // Best-effort cleanup for route changes and React strict mode replays.
        }
      }

      widgetIdRef.current = null;
      callbacksRef.current.onReadyChange?.(false);
      callbacksRef.current.onToken?.("");
    };
  }, [action, scriptReady, siteKey]);

  useEffect(() => {
    const turnstile = getTurnstileApi();

    if (!turnstile || widgetIdRef.current === null) {
      previousResetSignalRef.current = resetSignal;
      return;
    }

    if (previousResetSignalRef.current === resetSignal) {
      return;
    }

    previousResetSignalRef.current = resetSignal;

    try {
      turnstile.reset(widgetIdRef.current);
      callbacksRef.current.onToken?.("");
    } catch {
      callbacksRef.current.onError?.("turnstile_reset_failed");
    }
  }, [resetSignal]);

  return (
    <>
      {siteKey ? (
        <Script
          id={TURNSTILE_SCRIPT_ID}
          src={TURNSTILE_SCRIPT_SRC}
          strategy="afterInteractive"
          onLoad={() => {
            setScriptReady(true);
          }}
          onError={() => {
            callbacksRef.current.onReadyChange?.(false);
            callbacksRef.current.onError?.("script_load_failed");
          }}
        />
      ) : null}

      <div
        className={className}
        aria-disabled={disabled ? "true" : undefined}
      >
        <div ref={containerRef} />
      </div>
    </>
  );
}
