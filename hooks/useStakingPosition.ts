"use client";

import { useAccount, useReadContracts } from "wagmi";
import { type Address } from "viem";
import { stakingRewardsContract } from "@/lib/contracts";
import { DEFAULT_CHAIN_ID, REFETCH_INTERVAL } from "@/lib/constants";

/**
 * Returns the connected user's staking position:
 * - Staked USDX balance
 * - Pending (claimable) ETH rewards
 */
export function useStakingPosition() {
  const { address, chainId } = useAccount();
  const cid = chainId ?? DEFAULT_CHAIN_ID;
  const srConfig = stakingRewardsContract(cid);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...srConfig,
        functionName: "stakes",
        args: address ? [address as Address] : undefined,
      },
      {
        ...srConfig,
        functionName: "pendingRewards",
        args: address ? [address as Address] : undefined,
      },
    ],
    query: {
      refetchInterval: REFETCH_INTERVAL.MEDIUM,
      enabled: !!address,
    },
  });

  const results = data ?? [];

  // stakes() returns a struct — we need to check the ABI to know exact shape
  // For now treat it as a single uint256 (staked amount)
  const stakeData = results[0]?.result;
  const stakedBalance = typeof stakeData === "bigint"
    ? stakeData
    : Array.isArray(stakeData)
      ? (stakeData[0] as bigint) ?? 0n
      : 0n;

  return {
    /** User's staked USDX (18 decimals) */
    stakedBalance,
    /** User's claimable ETH rewards (18 decimals) */
    pendingRewards: (results[1]?.result as bigint) ?? 0n,
    isLoading,
    error,
    refetch,
  };
}
