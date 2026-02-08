"use client";

import { useAccount, useReadContract } from "wagmi";
import { type Address } from "viem";
import { stakingRewardsContract } from "@/lib/contracts";
import { DEFAULT_CHAIN_ID, REFETCH_INTERVAL } from "@/lib/constants";

export interface UnstakeRequest {
  /** Amount of USDX being unstaked (18 decimals) */
  amount: bigint;
  /** Unix timestamp when cooldown completes */
  completionTime: bigint;
  /** Whether the request is ready to complete */
  isReady: boolean;
  /** Seconds remaining until completion */
  secondsRemaining: number;
  /** Index in the user's unstake requests array */
  index: number;
}

/**
 * Fetches and parses the user's unstake requests from StakingRewards.
 * Each request has a cooldown period before it can be completed.
 */
export function useUnstakeRequests() {
  const { address, chainId } = useAccount();
  const cid = chainId ?? DEFAULT_CHAIN_ID;
  const srConfig = stakingRewardsContract(cid);

  const { data, isLoading, error, refetch } = useReadContract({
    ...srConfig,
    functionName: "getUnstakeRequests",
    args: address ? [address as Address] : undefined,
    query: {
      refetchInterval: REFETCH_INTERVAL.SLOW,
      enabled: !!address,
    },
  });

  const now = Math.floor(Date.now() / 1000);

  // Parse raw contract data into typed UnstakeRequest[]
  const requests: UnstakeRequest[] = [];
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const raw = data[i] as { amount: bigint; completionTime: bigint } | readonly [bigint, bigint];

      let amount: bigint;
      let completionTime: bigint;

      if (Array.isArray(raw) || (typeof raw === "object" && "0" in raw)) {
        // Tuple format
        const tuple = raw as readonly [bigint, bigint];
        amount = tuple[0];
        completionTime = tuple[1];
      } else {
        // Named struct format
        const struct = raw as { amount: bigint; completionTime: bigint };
        amount = struct.amount;
        completionTime = struct.completionTime;
      }

      // Skip zero-amount entries (completed/cleaned up)
      if (amount === 0n) continue;

      const completionSec = Number(completionTime);
      const secondsRemaining = Math.max(0, completionSec - now);

      requests.push({
        amount,
        completionTime,
        isReady: secondsRemaining === 0,
        secondsRemaining,
        index: i,
      });
    }
  }

  return {
    requests,
    /** Number of active (non-zero) unstake requests */
    activeCount: requests.length,
    /** Whether any request is ready to complete */
    hasReady: requests.some((r) => r.isReady),
    isLoading,
    error,
    refetch,
  };
}
