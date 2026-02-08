"use client";

import { useAccount } from "wagmi";
import { useStakingPosition } from "@/hooks/useStakingPosition";
import { useContractWrite } from "@/hooks/useContractWrite";
import { getContracts, ABIS } from "@/lib/contracts";
import { formatUSDX, formatETH } from "@/lib/format";
import { TxButton } from "@/components/shared/TxButton";
import { Skeleton } from "@/components/shared/Skeleton";

/**
 * Shows the user's staking position: staked balance + pending rewards + claim button.
 */
export function PositionCard() {
  const { isConnected, chainId } = useAccount();
  const cid = chainId ?? 1;
  const contracts = getContracts(cid);
  const { stakedBalance, pendingRewards, isLoading } = useStakingPosition();

  const claimTx = useContractWrite({ actionName: "Claim Rewards" });

  const handleClaim = () => {
    claimTx.execute({
      address: contracts.stakingRewards,
      abi: ABIS.stakingRewards,
      functionName: "claimRewards",
    });
  };

  if (!isConnected) return null;

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-5">
        <Skeleton className="mb-3 h-5 w-32" />
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>
    );
  }

  // Don't show if user has no position
  if (stakedBalance === 0n && pendingRewards === 0n) return null;

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-text-muted">Your Position</h3>

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-2xl font-semibold text-text-primary">
            {formatUSDX(stakedBalance)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">Staked</p>
        </div>

        <div className="text-right">
          <p className="font-mono text-lg text-success">
            {formatETH(pendingRewards)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">Rewards</p>
        </div>
      </div>

      {pendingRewards > 0n && (
        <div className="mt-4">
          <TxButton
            onClick={handleClaim}
            loading={claimTx.isPending || claimTx.isPrompting}
            loadingText="Claiming..."
            variant="secondary"
          >
            Claim Rewards
          </TxButton>
        </div>
      )}
    </div>
  );
}
