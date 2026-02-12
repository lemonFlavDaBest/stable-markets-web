"use client";

import { useState, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { type Hash } from "viem";
import { toast } from "sonner";
import { parseContractError } from "@/lib/errors";
import { etherscanTxUrl } from "@/lib/constants";
import { useUIStore } from "@/stores/ui";

export type TxStatus = "idle" | "prompting" | "pending" | "success" | "error";

interface UseContractWriteOptions {
  /** Human-readable action name for toasts, e.g. "Mint USDX" */
  actionName: string;
  /** Callback on successful confirmation */
  onSuccess?: (hash: Hash) => void;
}

/**
 * Centralized contract write hook with full toast lifecycle:
 * 1. "Waiting for wallet..." (prompting)
 * 2. "Transaction submitted" + etherscan link (pending)
 * 3. "Minted 990 USDX" success toast (success)
 * 4. Error toast with parsed message (error)
 *
 * Automatically invalidates all React Query caches on success.
 */
export function useContractWrite({ actionName, onSuccess }: UseContractWriteOptions) {
  const { chainId } = useAccount();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<Hash | undefined>();

  const { writeContractAsync } = useWriteContract();
  const triggerGridPulse = useUIStore((s) => s.triggerGridPulse);

  // Wait for receipt when we have a hash
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  const execute = useCallback(
    async (config: Parameters<typeof writeContractAsync>[0]) => {
      setStatus("prompting");
      setTxHash(undefined);

      try {
        const hash = await writeContractAsync(config);

        setTxHash(hash);
        setStatus("pending");

        // Show "submitted" toast with etherscan link
        const explorerUrl = chainId ? etherscanTxUrl(chainId, hash) : "";
        toast.info("Transaction submitted", {
          description: `${actionName} is being confirmed...`,
          action: explorerUrl
            ? {
                label: "View",
                onClick: () => window.open(explorerUrl, "_blank"),
              }
            : undefined,
        });

        // The receipt waiting is handled by wagmi's useWaitForTransactionReceipt
        // We need to manually poll since we can't await the hook
        const { waitForTransactionReceipt } = await import("wagmi/actions");
        const { wagmiConfig } = await import("@/providers/Web3Provider");

        await waitForTransactionReceipt(wagmiConfig, { hash });

        setStatus("success");
        triggerGridPulse();
        toast.success(`${actionName} confirmed!`);

        // Invalidate all queries to refresh balances/stats
        queryClient.invalidateQueries();

        onSuccess?.(hash);
      } catch (err) {
        setStatus("error");
        const message = parseContractError(err);

        // Don't show toast for user rejections — it's obvious
        if (message !== "Transaction rejected in wallet.") {
          toast.error(actionName + " failed", {
            description: message,
          });
        }
      }
    },
    [writeContractAsync, actionName, chainId, queryClient, onSuccess, triggerGridPulse]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(undefined);
  }, []);

  return {
    execute,
    reset,
    status,
    txHash,
    isPrompting: status === "prompting",
    isPending: status === "pending" || isConfirming,
    isSuccess: status === "success",
    isError: status === "error",
    isIdle: status === "idle",
  };
}
