"use client";

import { useState, useEffect } from "react";
import { formatTimeRemaining } from "@/lib/format";

interface CountdownProps {
  /** Unix timestamp (seconds) when countdown finishes */
  targetTimestamp: number;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  className?: string;
}

/**
 * Live "Xd Xh Xm" countdown timer.
 * Re-renders every 60 seconds. Shows "Ready" when complete.
 */
export function Countdown({ targetTimestamp, onComplete, className = "" }: CountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, targetTimestamp - Math.floor(Date.now() / 1000))
  );

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      const newRemaining = Math.max(
        0,
        targetTimestamp - Math.floor(Date.now() / 1000)
      );
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        onComplete?.();
        clearInterval(interval);
      }
    }, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, [targetTimestamp, remaining, onComplete]);

  return (
    <span className={`font-mono text-sm ${className}`}>
      {formatTimeRemaining(remaining)}
    </span>
  );
}
