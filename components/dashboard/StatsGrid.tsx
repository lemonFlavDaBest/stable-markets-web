"use client";

import { useProtocolStats } from "@/hooks/useProtocolStats";
import { formatCR, formatETH, formatUSD, formatUSDX, formatNumber, formatPercent } from "@/lib/format";
import { formatUnits } from "viem";
import { StatCard } from "./StatCard";

/**
 * 6-card grid showing key protocol metrics:
 * CR, TVL, Supply, ETH Price, Staked %, Volume remaining
 */
export function StatsGrid() {
  const {
    cr,
    ethReserves,
    totalSupply,
    currentPrice,
    totalStaked,
    volumeSinceUpdate,
    volumeCap,
    isLoading,
  } = useProtocolStats();

  const crFormatted = formatCR(cr);

  const stakedPercent =
    totalSupply > 0n
      ? Number((totalStaked * 10000n) / totalSupply) / 100
      : 0;

  const priceNum = Number(formatUnits(currentPrice, 8));
  const volumeRemaining = volumeCap > volumeSinceUpdate ? volumeCap - volumeSinceUpdate : 0n;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatCard
        label="Collateralization Ratio"
        value={crFormatted.text}
        color={crFormatted.color}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Value Locked"
        value={formatETH(ethReserves)}
        isLoading={isLoading}
      />
      <StatCard
        label="USDX Supply"
        value={formatUSDX(totalSupply, 0)}
        isLoading={isLoading}
      />
      <StatCard
        label="ETH Price"
        value={`$${formatNumber(priceNum, 2)}`}
        isLoading={isLoading}
      />
      <StatCard
        label="Staked"
        value={formatPercent(stakedPercent)}
        subtitle={formatUSDX(totalStaked, 0)}
        isLoading={isLoading}
      />
      <StatCard
        label="Volume Remaining"
        value={formatUSD(volumeRemaining)}
        isLoading={isLoading}
      />
    </div>
  );
}
