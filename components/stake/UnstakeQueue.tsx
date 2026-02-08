"use client";

import { useAccount } from "wagmi";
import { useUnstakeRequests } from "@/hooks/useUnstakeRequests";
import { useContractWrite } from "@/hooks/useContractWrite";
import { getContracts, ABIS } from "@/lib/contracts";
import { formatUSDX } from "@/lib/format";
import { Countdown } from "@/components/shared/Countdown";
import { Skeleton } from "@/components/shared/Skeleton";

/**
 * Shows the user's pending unstake requests with countdown timers
 * and action buttons to complete or cleanup expired requests.
 */
export function UnstakeQueue() {
  const { isConnected, chainId } = useAccount();
  const cid = chainId ?? 1;
  const contracts = getContracts(cid);
  const { requests, isLoading, refetch } = useUnstakeRequests();

  const completeTx = useContractWrite({
    actionName: "Complete Unstake",
    onSuccess: () => refetch(),
  });

  if (!isConnected || (requests.length === 0 && !isLoading)) return null;

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-5">
        <Skeleton className="mb-3 h-5 w-32" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-text-muted">
        Unstake Queue ({requests.length})
      </h3>

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.index}
            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
          >
            <div>
              <p className="font-mono text-sm font-medium text-text-primary">
                {formatUSDX(req.amount)}
              </p>
              {req.isReady ? (
                <p className="text-xs text-success">Ready to withdraw</p>
              ) : (
                <Countdown
                  targetTimestamp={Number(req.completionTime)}
                  onComplete={() => refetch()}
                  className="text-text-muted"
                />
              )}
            </div>

            {req.isReady && (
              <button
                type="button"
                onClick={() => {
                  completeTx.execute({
                    address: contracts.stakingRewards,
                    abi: ABIS.stakingRewards,
                    functionName: "completeUnstake",
                    args: [BigInt(req.index)],
                  });
                }}
                disabled={completeTx.isPending || completeTx.isPrompting}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                {completeTx.isPending ? "Completing..." : "Complete"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
