"use client";

import Script from "next/script";
import { useTheme } from "next-themes";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = {
  /** Clears the solved token; Turnstile tokens are single use. */
  reset: () => void;
};

type TurnstileWidgetProps = {
  siteKey: string;
  /** Receives the token when solved, and `null` when it expires or fails. */
  onToken: (token: string | null) => void;
};

/**
 * Cloudflare Turnstile challenge, rendered explicitly so it can be reset
 * after each submit and follow the app theme.
 */
export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ siteKey, onToken }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    const [scriptReady, setScriptReady] = useState(
      () => typeof window !== "undefined" && Boolean(window.turnstile)
    );
    const { resolvedTheme } = useTheme();

    useEffect(() => {
      onTokenRef.current = onToken;
    }, [onToken]);

    useEffect(() => {
      const api = window.turnstile;
      const container = containerRef.current;
      if (!scriptReady || !api || !container) return;

      const widgetId = api.render(container, {
        sitekey: siteKey,
        theme: resolvedTheme === "dark" ? "dark" : "light",
        size: "flexible",
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
      widgetIdRef.current = widgetId;

      return () => {
        api.remove(widgetId);
        widgetIdRef.current = null;
      };
    }, [scriptReady, siteKey, resolvedTheme]);

    const reset = useCallback(() => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      onTokenRef.current(null);
    }, []);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
        <div ref={containerRef} className="w-full min-h-[65px]" />
      </>
    );
  }
);
