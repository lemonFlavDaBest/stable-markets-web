"use client";

import { useAccount, useReadContract } from "wagmi";
import { bondingCurveContract } from "@/lib/contracts";
import { REFETCH_INTERVAL } from "@/lib/constants";

/**
 * Get the ETH return for redeeming a given amount of USDX tokens.
 * Uses BondingCurveCore.calculateRedeemReturn(tokensIn) -> (ethOut, fee).
 */
export function useRedeemQuote(tokensIn: bigint) {
  const { chainId } = useAccount();
  const cid = chainId ?? 1;
  const bcConfig = bondingCurveContract(cid);

  const { data, isLoading, error, refetch } = useReadContract({
    ...bcConfig,
    functionName: "calculateRedeemReturn",
    args: [tokensIn],
    query: {
      refetchInterval: REFETCH_INTERVAL.QUOTE,
      enabled: tokensIn > 0n,
    },
  });

  // calculateRedeemReturn returns a struct/tuple: (uint256 ethOut, uint256 fee)
  const result = data as readonly [bigint, bigint] | undefined;

  return {
    /** ETH the user will receive (18 decimals) */
    ethOut: result?.[0] ?? 0n,
    /** Total fee taken (18 decimals) */
    fee: result?.[1] ?? 0n,
    isLoading: tokensIn > 0n && isLoading,
    error,
    refetch,
  };
}
