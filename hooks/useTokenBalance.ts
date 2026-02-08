"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { type Address } from "viem";
import { stableCoinContract } from "@/lib/contracts";
import { REFETCH_INTERVAL } from "@/lib/constants";

/**
 * Returns both ETH and USDX balances for the connected wallet.
 * ETH refreshes per-block via wagmi's built-in polling.
 * USDX uses an ERC20 balanceOf read.
 */
export function useTokenBalance() {
  const { address, chainId } = useAccount();

  const {
    data: ethBalance,
    isLoading: ethLoading,
    refetch: refetchEth,
  } = useBalance({
    address,
    query: {
      refetchInterval: REFETCH_INTERVAL.FAST,
      enabled: !!address,
    },
  });

  const usdxConfig = chainId ? stableCoinContract(chainId) : undefined;

  const {
    data: usdxBalance,
    isLoading: usdxLoading,
    refetch: refetchUsdx,
  } = useReadContract({
    ...usdxConfig,
    functionName: "balanceOf",
    args: address ? [address as Address] : undefined,
    query: {
      refetchInterval: REFETCH_INTERVAL.FAST,
      enabled: !!address && !!usdxConfig,
    },
  });

  const refetch = () => {
    refetchEth();
    refetchUsdx();
  };

  return {
    ethBalance: ethBalance?.value ?? 0n,
    usdxBalance: (usdxBalance as bigint) ?? 0n,
    isLoading: ethLoading || usdxLoading,
    refetch,
  };
}
