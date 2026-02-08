"use client";


interface SwapDetailsProps {
  /** Exchange rate: "1 ETH = X USDX" or "1 USDX = X ETH" */
  rate: string;
  /** Fee amount in ETH (formatted) */
  fee?: string;
  /** Minimum received after slippage */
  minReceived?: string;
  /** Slippage display */
  slippage?: string;
  /** Whether details are loading */
  isLoading?: boolean;
}

/**
 * Expandable details panel below the trade inputs.
 * Shows rate, fees, minimum received, and slippage.
 */
export function SwapDetails({
  rate,
  fee,
  minReceived,
  slippage,
  isLoading = false,
}: SwapDetailsProps) {
  if (isLoading) {
    return (
      <div className="mt-2 rounded-xl border border-border bg-card/50 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
      </div>
    );
  }

  if (!rate) return null;

  return (
    <div className="mt-2 space-y-1.5 rounded-xl border border-border bg-card/50 px-4 py-3 text-xs text-text-secondary">
      <DetailRow label="Rate" value={rate} />
      {fee && <DetailRow label="Fee" value={fee} />}
      {minReceived && <DetailRow label="Min. Received" value={minReceived} />}
      {slippage && <DetailRow label="Slippage" value={slippage} />}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
