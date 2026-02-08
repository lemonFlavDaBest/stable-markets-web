"use client";

import { useProtocolWarnings, type ProtocolWarning, type WarningLevel } from "@/hooks/useProtocolWarnings";
import { useUIStore } from "@/stores/ui";

const LEVEL_STYLES: Record<WarningLevel, string> = {
  error: "border-error/30 bg-error/10 text-error",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-primary/30 bg-primary/10 text-text-secondary",
};

function WarningItem({ warning }: { warning: ProtocolWarning }) {
  const { dismissWarning } = useUIStore();

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm ${LEVEL_STYLES[warning.level]}`}
    >
      <span>{warning.message}</span>
      {warning.dismissable && (
        <button
          onClick={() => dismissWarning(warning.key)}
          className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Renders protocol warning banners at the top of the page.
 * Warnings are derived from protocol state (paused, CR, oracle, etc.).
 */
export function WarningBanner() {
  const warnings = useProtocolWarnings();

  if (warnings.length === 0) return null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pt-4">
      {warnings.map((w) => (
        <WarningItem key={w.key} warning={w} />
      ))}
    </div>
  );
}
