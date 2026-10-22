"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "cc_consent_v1";

type ConsentState = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY) as ConsentState | null;
      setConsent(stored);
    } catch {
      setConsent(null);
    }
  }, []);

  function save(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(COOKIE_KEY, value);
    } catch {
      // storage blocked in private mode — just hide the banner
    }
    setConsent(value);
  }

  if (consent !== null && consent !== "loading") return null;
  if (consent === "loading") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to understand how visitors use ClearCycle and to improve the experience.
          See our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => save("rejected")}
          >
            Reject non-essential
          </Button>
          <Button
            size="sm"
            className="bg-[#1E6BFF] text-white hover:bg-[#1E6BFF]/90"
            onClick={() => save("accepted")}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
