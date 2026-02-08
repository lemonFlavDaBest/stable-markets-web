"use client";

import { useProtocolStats } from "@/hooks/useProtocolStats";
import { formatCR, formatETH, formatNumber } from "@/lib/format";
import { formatUnits } from "viem";
import { Skeleton } from "@/components/shared/Skeleton";

/**
 * Horizontal strip showing key protocol metrics below the trade card.
 * CR | TVL | ETH Price | Volume remaining
 */
export function ProtocolStatsBar() {
  const { cr, ethReserves, currentPrice, volumeSinceUpdate, volumeCap, isLoading } =
    useProtocolStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-6 rounded-xl border border-border bg-card/50 px-4 py-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  const crFormatted = formatCR(cr);
  const priceNum = Number(formatUnits(currentPrice, 18));
  const volumeRemaining = volumeCap > volumeSinceUpdate ? volumeCap - volumeSinceUpdate : 0n;

  const CR_COLORS = {
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card/50 px-4 py-3 text-xs">
      <Stat
        label="CR"
        value={crFormatted.text}
        className={CR_COLORS[crFormatted.color]}
      />
      <Stat label="TVL" value={formatETH(ethReserves)} />
      <Stat label="Price" value={`$${formatNumber(priceNum, 2)}`} />
      <Stat label="Vol. Left" value={formatETH(volumeRemaining)} />
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted">{label}</span>
      <span className={`font-mono font-medium ${className || "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
