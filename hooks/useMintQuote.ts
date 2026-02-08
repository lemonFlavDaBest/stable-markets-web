"use client";

import { useAccount, useReadContract } from "wagmi";
import { bondingCurveContract } from "@/lib/contracts";
import { DEFAULT_CHAIN_ID, REFETCH_INTERVAL } from "@/lib/constants";

/**
 * Get the ETH cost to mint a given amount of USDX tokens.
 * Uses BondingCurveCore.calculateMintCost(tokensOut) -> ethCost.
 *
 * For the reverse direction (ETH input -> USDX output), the caller
 * should approximate using currentPrice and display with "~" prefix.
 */
export function useMintQuote(tokensOut: bigint) {
  const { chainId } = useAccount();
  const cid = chainId ?? DEFAULT_CHAIN_ID;
  const bcConfig = bondingCurveContract(cid);

  const { data, isLoading, error, refetch } = useReadContract({
    ...bcConfig,
    functionName: "calculateMintCost",
    args: [tokensOut],
    query: {
      refetchInterval: REFETCH_INTERVAL.QUOTE,
      enabled: tokensOut > 0n,
    },
  });

  return {
    /** ETH cost to mint the requested tokens (18 decimals) */
    ethCost: (data as bigint) ?? 0n,
    isLoading: tokensOut > 0n && isLoading,
    error,
    refetch,
  };
}
