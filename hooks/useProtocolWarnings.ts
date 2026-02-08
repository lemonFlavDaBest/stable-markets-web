"use client";

import { useProtocolStats } from "./useProtocolStats";
import { useUIStore } from "@/stores/ui";
import { formatUnits } from "viem";

export type WarningLevel = "error" | "warning" | "info";

export interface ProtocolWarning {
  key: string;
  level: WarningLevel;
  message: string;
  dismissable: boolean;
}

const WARMUP_PERIOD_SECONDS = 30 * 24 * 60 * 60; // 30 days
const ORACLE_STALE_THRESHOLD = 3600; // 1 hour

/**
 * Derives warning banners from current protocol state.
 * Checks for oracle staleness, pause state, CR levels,
 * warmup period, and deprecation.
 */
export function useProtocolWarnings(): ProtocolWarning[] {
  const {
    paused,
    deprecated,
    cr,
    lastPriceUpdate,
    deploymentTime,
  } = useProtocolStats();

  const { dismissedWarnings } = useUIStore();

  const warnings: ProtocolWarning[] = [];
  const now = Math.floor(Date.now() / 1000);

  // Protocol paused — highest priority
  if (paused) {
    warnings.push({
      key: "paused",
      level: "error",
      message: "Protocol is paused. Trading is disabled.",
      dismissable: false,
    });
  }

  // Contract deprecated
  if (deprecated) {
    warnings.push({
      key: "deprecated",
      level: "info",
      message: "This contract version is deprecated. Please migrate to the new version.",
      dismissable: true,
    });
  }

  // Critical CR (< 70%)
  const crPercent = Number(formatUnits(cr, 16));
  if (cr > 0n && crPercent < 70) {
    warnings.push({
      key: "critical-cr",
      level: "error",
      message: `CR critically low (${crPercent.toFixed(1)}%). Redemptions disabled.`,
      dismissable: false,
    });
  } else if (cr > 0n && crPercent < 120) {
    // Liquidation fees active
    warnings.push({
      key: "low-cr",
      level: "warning",
      message: `Liquidation fees active. CR below 120% (${crPercent.toFixed(1)}%).`,
      dismissable: true,
    });
  }

  // Oracle staleness
  if (lastPriceUpdate > 0n) {
    const staleSec = now - Number(lastPriceUpdate);
    if (staleSec > ORACLE_STALE_THRESHOLD) {
      const hours = (staleSec / 3600).toFixed(1);
      warnings.push({
        key: "oracle-stale",
        level: "warning",
        message: `Oracle price is ${hours} hours old. Prices may be inaccurate.`,
        dismissable: true,
      });
    }
  }

  // Warmup period
  if (deploymentTime > 0n) {
    const elapsed = now - Number(deploymentTime);
    if (elapsed < WARMUP_PERIOD_SECONDS) {
      const day = Math.ceil(elapsed / 86400);
      warnings.push({
        key: "warmup",
        level: "info",
        message: `Warmup period (Day ${day}/30). Volume caps are reduced.`,
        dismissable: true,
      });
    }
  }

  // Filter out dismissed warnings
  return warnings.filter(
    (w) => !w.dismissable || !dismissedWarnings.has(w.key)
  );
}
