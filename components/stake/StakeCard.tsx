"use client";

import { useState, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import { TokenInput } from "@/components/shared/TokenInput";
import { TxButton } from "@/components/shared/TxButton";
import { useUIStore } from "@/stores/ui";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useStakingPosition } from "@/hooks/useStakingPosition";
import { useContractWrite } from "@/hooks/useContractWrite";
import { getContracts, ABIS } from "@/lib/contracts";
import { parseTokenInput } from "@/lib/format";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

/**
 * Stake/Unstake card with tabs, token input, and approval flow.
 */
export function StakeCard() {
  const { chainId } = useAccount();
  const cid = chainId ?? DEFAULT_CHAIN_ID;
  const contracts = getContracts(cid);

  const { stakeTab, setStakeTab } = useUIStore();
  const [inputValue, setInputValue] = useState("");

  const { usdxBalance } = useTokenBalance();
  const { stakedBalance } = useStakingPosition();
  const { hasAllowance, refetch: refetchAllowance } = useTokenAllowance(
    contracts.stakingRewards
  );

  const inputAmount = useMemo(() => parseTokenInput(inputValue), [inputValue]);
  const isStake = stakeTab === "stake";

  const needsApproval = isStake && inputAmount > 0n && !hasAllowance(inputAmount);

  const stakeTx = useContractWrite({ actionName: "Stake USDX" });
  const unstakeTx = useContractWrite({ actionName: "Initiate Unstake" });
  const approveTx = useContractWrite({
    actionName: "Approve USDX",
    onSuccess: () => refetchAllowance(),
  });

  const activeTx = needsApproval ? approveTx : isStake ? stakeTx : unstakeTx;

  const handleExecute = useCallback(() => {
    if (needsApproval) {
      approveTx.execute({
        address: contracts.stableCoin,
        abi: ABIS.stableCoin,
        functionName: "approve",
        args: [contracts.stakingRewards, inputAmount],
      });
      return;
    }

    if (isStake) {
      stakeTx.execute({
        address: contracts.stakingRewards,
        abi: ABIS.stakingRewards,
        functionName: "stake",
        args: [inputAmount],
      });
    } else {
      unstakeTx.execute({
        address: contracts.stakingRewards,
        abi: ABIS.stakingRewards,
        functionName: "initiateUnstake",
        args: [inputAmount],
      });
    }
  }, [isStake, needsApproval, contracts, inputAmount, stakeTx, unstakeTx, approveTx]);

  const buttonState = useMemo(() => {
    if (activeTx.isPrompting) return { label: "Waiting for wallet...", disabled: true, loading: true };
    if (activeTx.isPending) return { label: "Confirming...", disabled: true, loading: true };
    if (!inputValue || inputAmount === 0n) return { label: "Enter Amount", disabled: true, loading: false };

    if (isStake) {
      if (inputAmount > usdxBalance) return { label: "Insufficient USDX", disabled: true, loading: false };
      if (needsApproval) return { label: "Approve USDX", disabled: false, loading: false };
      return { label: "Stake USDX", disabled: false, loading: false };
    } else {
      if (inputAmount > stakedBalance) return { label: "Insufficient Staked Balance", disabled: true, loading: false };
      return { label: "Initiate Unstake", disabled: false, loading: false };
    }
  }, [activeTx.isPrompting, activeTx.isPending, inputValue, inputAmount, isStake, usdxBalance, stakedBalance, needsApproval]);

  const handleTabSwitch = (tab: "stake" | "unstake") => {
    setStakeTab(tab);
    setInputValue("");
    stakeTx.reset();
    unstakeTx.reset();
    approveTx.reset();
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4">
      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-background p-1">
        <TabButton active={stakeTab === "stake"} onClick={() => handleTabSwitch("stake")}>
          Stake
        </TabButton>
        <TabButton active={stakeTab === "unstake"} onClick={() => handleTabSwitch("unstake")}>
          Unstake
        </TabButton>
      </div>

      <TokenInput
        token="USDX"
        label={isStake ? "Amount to stake" : "Amount to unstake"}
        value={inputValue}
        onChange={setInputValue}
        balance={isStake ? usdxBalance : stakedBalance}
      />

      {!isStake && inputAmount > 0n && (
        <p className="mt-2 text-xs text-text-muted">
          Unstaking starts a 14-day cooldown period before you can withdraw.
        </p>
      )}

      <div className="mt-4">
        <TxButton
          onClick={handleExecute}
          disabled={buttonState.disabled}
          loading={buttonState.loading}
          loadingText={buttonState.label}
          overrideLabel={buttonState.disabled ? buttonState.label : undefined}
        >
          {buttonState.label}
        </TxButton>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-card text-text-primary"
          : "text-text-muted hover:text-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}
