"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import {
  reserveManagerContract,
  bondingCurveContract,
} from "@/lib/contracts";
import { formatNumber, formatPercent } from "@/lib/format";
import { REFETCH_INTERVAL } from "@/lib/constants";
import { Skeleton } from "@/components/shared/Skeleton";

/**
 * Advanced market parameters table for the dashboard.
 * Shows slope, volatility, net flow, fees, warmup, crisis multiplier.
 */
export function MarketParams() {
  const { chainId } = useAccount();
  const cid = chainId ?? 1;
  const rmConfig = reserveManagerContract(cid);
  const bcConfig = bondingCurveContract(cid);

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...rmConfig, functionName: "getVolatility" },
      { ...rmConfig, functionName: "getNetFlow" },
      { ...bcConfig, functionName: "getWarmupMultiplier" },
    ],
    query: {
      refetchInterval: REFETCH_INTERVAL.SLOW,
    },
  });

  const results = data ?? [];
  const volatility = (results[0]?.result as bigint) ?? 0n;
  const netFlow = (results[1]?.result as bigint) ?? 0n;
  const warmupMultiplier = (results[2]?.result as bigint) ?? 0n;

  // Format values
  const volatilityPct = Number(formatUnits(volatility, 16));
  const netFlowEth = Number(formatUnits(netFlow, 18));
  const warmupPct = Number(formatUnits(warmupMultiplier, 16));

  const params = [
    {
      label: "Volatility (7d)",
      value: formatPercent(volatilityPct),
    },
    {
      label: "Net Flow",
      value: `${netFlowEth >= 0 ? "+" : ""}${formatNumber(netFlowEth, 4)} ETH`,
    },
    {
      label: "Warmup Multiplier",
      value: formatPercent(warmupPct),
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <h3 className="border-b border-border px-4 py-3 text-sm font-medium text-text-muted">
        Market Parameters
      </h3>
      <div className="divide-y divide-border">
        {params.map((param) => (
          <div
            key={param.label}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm text-text-secondary">{param.label}</span>
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="font-mono text-sm text-text-primary">
                {param.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
