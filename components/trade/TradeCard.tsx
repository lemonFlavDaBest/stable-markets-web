"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import { formatUnits, type Address } from "viem";
import { useSearchParams } from "next/navigation";
import { TokenInput } from "@/components/shared/TokenInput";
import { TxButton } from "@/components/shared/TxButton";
import { SwapDetails } from "./SwapDetails";
import { SlippageSettings } from "./SlippageSettings";
import { useUIStore } from "@/stores/ui";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useMintQuote } from "@/hooks/useMintQuote";
import { useRedeemQuote } from "@/hooks/useRedeemQuote";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useContractWrite } from "@/hooks/useContractWrite";
import { getContracts, ABIS } from "@/lib/contracts";
import { parseTokenInput, formatNumber, formatETH } from "@/lib/format";
import { BASIS_POINTS } from "@/lib/constants";

/**
 * Main trade card with Mint/Redeem tabs.
 * Handles bidirectional quoting, approval flows, and slippage protection.
 */
export function TradeCard() {
  const { chainId } = useAccount();
  const cid = chainId ?? 1;
  const contracts = getContracts(cid);
  const searchParams = useSearchParams();

  // UI state
  const { tradeTab, setTradeTab, slippageBps, referrer, setReferrer } = useUIStore();
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  // Parse referrer from URL on mount
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      setReferrer(ref as Address);
    }
  }, [searchParams, setReferrer]);

  // Balances
  const { ethBalance, usdxBalance } = useTokenBalance();

  // Protocol state
  const { currentPrice, paused } = useProtocolStats();

  // Convert input to bigint for quoting
  const isMint = tradeTab === "mint";

  // For mint: user enters USDX amount they want -> we quote ETH cost
  // For redeem: user enters USDX amount to burn -> we quote ETH return
  const inputAmount = useMemo(
    () => parseTokenInput(inputValue),
    [inputValue]
  );

  // Mint quote (USDX output -> ETH cost)
  const mintQuote = useMintQuote(isMint ? inputAmount : 0n);
  // Redeem quote (USDX input -> ETH output)
  const redeemQuote = useRedeemQuote(!isMint ? inputAmount : 0n);

  // Calculate the other side of the trade
  useEffect(() => {
    if (isMint) {
      if (inputAmount === 0n) {
        setOutputValue("");
        return;
      }
      if (mintQuote.ethCost > 0n) {
        const ethStr = formatUnits(mintQuote.ethCost, 18);
        const trimmed = parseFloat(ethStr).toString();
        setOutputValue(trimmed);
      }
    } else {
      if (inputAmount === 0n) {
        setOutputValue("");
        return;
      }
      if (redeemQuote.ethOut > 0n) {
        const ethStr = formatUnits(redeemQuote.ethOut, 18);
        const trimmed = parseFloat(ethStr).toString();
        setOutputValue(trimmed);
      }
    }
  }, [isMint, inputAmount, mintQuote.ethCost, redeemQuote.ethOut]);

  // Allowance for redeem (need USDX approved to BondingCurve)
  const { hasAllowance, refetch: refetchAllowance } = useTokenAllowance(
    contracts.bondingCurve
  );

  // Determine if approval is needed (redeem requires USDX approval)
  const needsApproval = !isMint && inputAmount > 0n && !hasAllowance(inputAmount);

  // Contract write hooks
  const mintTx = useContractWrite({ actionName: "Mint USDX" });
  const redeemTx = useContractWrite({ actionName: "Redeem ETH" });
  const approveTx = useContractWrite({
    actionName: "Approve USDX",
    onSuccess: () => refetchAllowance(),
  });

  const activeTx = isMint ? mintTx : needsApproval ? approveTx : redeemTx;

  // Slippage calculation
  const minOut = useMemo(() => {
    if (isMint) {
      // Min tokens out = inputAmount * (1 - slippage)
      return (inputAmount * (BASIS_POINTS - BigInt(slippageBps))) / BASIS_POINTS;
    } else {
      // Min ETH out = ethOut * (1 - slippage)
      return (redeemQuote.ethOut * (BASIS_POINTS - BigInt(slippageBps))) / BASIS_POINTS;
    }
  }, [isMint, inputAmount, redeemQuote.ethOut, slippageBps]);

  // Execute trade
  const handleExecute = useCallback(() => {
    if (needsApproval) {
      // Approve USDX for BondingCurve
      approveTx.execute({
        address: contracts.stableCoin,
        abi: ABIS.stableCoin,
        functionName: "approve",
        args: [contracts.bondingCurve, inputAmount],
      });
      return;
    }

    if (isMint) {
      mintTx.execute({
        address: contracts.bondingCurve,
        abi: ABIS.bondingCurve,
        functionName: "mint",
        args: [minOut, referrer],
        value: mintQuote.ethCost,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    } else {
      redeemTx.execute({
        address: contracts.bondingCurve,
        abi: ABIS.bondingCurve,
        functionName: "redeem",
        args: [inputAmount, minOut, referrer],
      });
    }
  }, [
    isMint, needsApproval, contracts, inputAmount, minOut, referrer,
    mintQuote.ethCost, mintTx, redeemTx, approveTx,
  ]);

  // Button state logic
  const buttonState = useMemo(() => {
    if (activeTx.isPrompting) return { label: "Waiting for wallet...", disabled: true, loading: true };
    if (activeTx.isPending) return { label: "Confirming...", disabled: true, loading: true };
    if (paused) return { label: "Protocol Paused", disabled: true, loading: false };
    if (!inputValue || inputAmount === 0n) return { label: "Enter Amount", disabled: true, loading: false };

    if (isMint) {
      // Check ETH balance
      if (mintQuote.ethCost > ethBalance) {
        return { label: "Insufficient ETH", disabled: true, loading: false };
      }
    } else {
      if (inputAmount > usdxBalance) {
        return { label: "Insufficient USDX", disabled: true, loading: false };
      }
      if (needsApproval) {
        return { label: "Approve USDX", disabled: false, loading: false };
      }
    }

    return {
      label: isMint ? "Mint USDX" : "Redeem ETH",
      disabled: false,
      loading: false,
    };
  }, [
    activeTx.isPrompting, activeTx.isPending, paused,
    inputValue, inputAmount, isMint, mintQuote.ethCost,
    ethBalance, usdxBalance, needsApproval,
  ]);

  // Swap details
  const swapDetailsProps = useMemo(() => {
    if (inputAmount === 0n) return { rate: "" };

    if (isMint) {
      const priceNum = Number(formatUnits(currentPrice, 18));
      return {
        rate: `1 ETH ≈ ${formatNumber(priceNum > 0 ? priceNum : 0, 2)} USDX`,
        fee: undefined, // Mint fees are built into the curve
        minReceived: `${formatNumber(Number(formatUnits(minOut, 18)), 4)} USDX`,
        slippage: `${slippageBps / 100}%`,
      };
    }

    return {
      rate: currentPrice > 0n
        ? `1 USDX ≈ ${formatNumber(1 / Number(formatUnits(currentPrice, 18)), 6)} ETH`
        : "",
      fee: redeemQuote.fee > 0n
        ? formatETH(redeemQuote.fee)
        : undefined,
      minReceived: `${formatNumber(Number(formatUnits(minOut, 18)), 6)} ETH`,
      slippage: `${slippageBps / 100}%`,
    };
  }, [inputAmount, isMint, currentPrice, minOut, redeemQuote.fee, slippageBps]);

  // Clear input on tab switch
  const handleTabSwitch = (tab: "mint" | "redeem") => {
    setTradeTab(tab);
    setInputValue("");
    setOutputValue("");
    mintTx.reset();
    redeemTx.reset();
    approveTx.reset();
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4">
      {/* Header: Tabs + Slippage */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-background p-1">
          <TabButton
            active={tradeTab === "mint"}
            onClick={() => handleTabSwitch("mint")}
          >
            Mint
          </TabButton>
          <TabButton
            active={tradeTab === "redeem"}
            onClick={() => handleTabSwitch("redeem")}
          >
            Redeem
          </TabButton>
        </div>
        <SlippageSettings />
      </div>

      {/* Input: What user is providing */}
      <TokenInput
        token={isMint ? "USDX" : "USDX"}
        label={isMint ? "You receive" : "You pay"}
        value={inputValue}
        onChange={setInputValue}
        balance={isMint ? undefined : usdxBalance}
        showMax={!isMint}
      />

      {/* Swap arrow */}
      <div className="flex justify-center -my-2 relative z-10">
        <div className="rounded-lg border border-border bg-card p-1.5">
          <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </div>

      {/* Output: What user receives */}
      <TokenInput
        token={isMint ? "ETH" : "ETH"}
        label={isMint ? "You pay" : "You receive"}
        value={outputValue}
        onChange={() => {}} // Output is read-only for now
        balance={isMint ? ethBalance : undefined}
        disabled
        showMax={false}
      />

      {/* Swap details */}
      <SwapDetails
        {...swapDetailsProps}
        isLoading={mintQuote.isLoading || redeemQuote.isLoading}
      />

      {/* Action button */}
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
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-card text-text-primary"
          : "text-text-muted hover:text-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}
