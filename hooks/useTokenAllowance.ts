"use client";

import { useAccount, useReadContract } from "wagmi";
import { type Address } from "viem";
import { stableCoinContract } from "@/lib/contracts";

/**
 * Check the USDX allowance for a given spender contract.
 * Used to determine if an approval step is needed before redeem/stake.
 */
export function useTokenAllowance(spender: Address | undefined) {
  const { address, chainId } = useAccount();

  const usdxConfig = chainId ? stableCoinContract(chainId) : undefined;

  const {
    data: allowance,
    isLoading,
    refetch,
  } = useReadContract({
    ...usdxConfig,
    functionName: "allowance",
    args: address && spender ? [address as Address, spender] : undefined,
    query: {
      enabled: !!address && !!spender && !!usdxConfig,
    },
  });

  return {
    allowance: (allowance as bigint) ?? 0n,
    isLoading,
    refetch,
    /** Whether the current allowance covers a given amount */
    hasAllowance: (amount: bigint) => (allowance as bigint ?? 0n) >= amount,
  };
}
