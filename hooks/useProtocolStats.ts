"use client";

import { useAccount, useReadContracts } from "wagmi";
import {
  bondingCurveContract,
  stableCoinContract,
  stakingRewardsContract,
} from "@/lib/contracts";
import { DEFAULT_CHAIN_ID, REFETCH_INTERVAL } from "@/lib/constants";

/**
 * Aggregates key protocol statistics from multiple contracts:
 * CR, ETH reserves (TVL), total USDX supply, current price,
 * volume since update, volume cap, paused status, total staked.
 */
export function useProtocolStats() {
  const { chainId } = useAccount();
  const cid = chainId ?? DEFAULT_CHAIN_ID;

  const bcConfig = bondingCurveContract(cid);
  const scConfig = stableCoinContract(cid);
  const srConfig = stakingRewardsContract(cid);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      { ...bcConfig, functionName: "getCurrentCR" },
      { ...bcConfig, functionName: "ethReserves" },
      { ...scConfig, functionName: "totalSupply" },
      { ...bcConfig, functionName: "currentPrice" },
      { ...bcConfig, functionName: "volumeSinceUpdate" },
      { ...bcConfig, functionName: "getCurrentVolumeCap" },
      { ...bcConfig, functionName: "paused" },
      { ...bcConfig, functionName: "deprecated" },
      { ...bcConfig, functionName: "lastPriceUpdate" },
      { ...bcConfig, functionName: "getWarmupMultiplier" },
      { ...bcConfig, functionName: "deploymentTime" },
      { ...srConfig, functionName: "totalStaked" },
    ],
    query: {
      refetchInterval: REFETCH_INTERVAL.MEDIUM,
    },
  });

  const results = data ?? [];

  return {
    /** Collateralization ratio (18 decimals, 1e18 = 100%) */
    cr: (results[0]?.result as bigint) ?? 0n,
    /** ETH reserves / TVL (18 decimals) */
    ethReserves: (results[1]?.result as bigint) ?? 0n,
    /** Total USDX supply (18 decimals) */
    totalSupply: (results[2]?.result as bigint) ?? 0n,
    /** Current bonding curve price (18 decimals) */
    currentPrice: (results[3]?.result as bigint) ?? 0n,
    /** Volume traded since last oracle update */
    volumeSinceUpdate: (results[4]?.result as bigint) ?? 0n,
    /** Current volume cap */
    volumeCap: (results[5]?.result as bigint) ?? 0n,
    /** Whether the protocol is paused */
    paused: (results[6]?.result as boolean) ?? false,
    /** Whether the contract is deprecated */
    deprecated: (results[7]?.result as boolean) ?? false,
    /** Timestamp of last price update */
    lastPriceUpdate: (results[8]?.result as bigint) ?? 0n,
    /** Warmup multiplier (how much of volume cap is unlocked) */
    warmupMultiplier: (results[9]?.result as bigint) ?? 0n,
    /** Contract deployment time */
    deploymentTime: (results[10]?.result as bigint) ?? 0n,
    /** Total USDX staked */
    totalStaked: (results[11]?.result as bigint) ?? 0n,

    isLoading,
    error,
    refetch,
  };
}
