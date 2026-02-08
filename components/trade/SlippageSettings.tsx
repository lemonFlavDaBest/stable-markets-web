"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUIStore } from "@/stores/ui";
import { useContractWrite } from "@/hooks/useContractWrite";
import { SLIPPAGE_OPTIONS, MAX_SLIPPAGE_BPS, DEFAULT_CHAIN_ID } from "@/lib/constants";
import { getContracts, ABIS } from "@/lib/contracts";

/**
 * Gear icon that opens a popover for slippage tolerance selection.
 * Options: 0.1%, 0.5%, 1.0%, or custom input.
 */
export function SlippageSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { slippageBps, setSlippageBps } = useUIStore();
  const { chainId } = useAccount();
  const contracts = getContracts(chainId ?? DEFAULT_CHAIN_ID);
  const updatePriceTx = useContractWrite({ actionName: "Update Price" });
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const isCustom = !SLIPPAGE_OPTIONS.some((o) => o.value === slippageBps);

  const handleCustomChange = (val: string) => {
    setCustomValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const bps = Math.min(Math.round(num * 100), MAX_SLIPPAGE_BPS);
      setSlippageBps(bps);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-card hover:text-text-secondary"
        aria-label="Slippage settings"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-lg">
          <h4 className="mb-3 text-sm font-medium text-text-primary">
            Slippage Tolerance
          </h4>

          <div className="flex gap-2">
            {SLIPPAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSlippageBps(option.value);
                  setCustomValue("");
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  slippageBps === option.value
                    ? "bg-primary/10 text-primary"
                    : "bg-background text-text-secondary hover:text-text-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Custom"
              value={isCustom ? (customValue || (slippageBps / 100).toString()) : customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-border-accent"
            />
            <span className="text-sm text-text-muted">%</span>
          </div>

          {slippageBps > 100 && (
            <p className="mt-2 text-xs text-warning">
              High slippage may result in unfavorable execution.
            </p>
          )}

          {/* Update oracle price */}
          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              disabled={updatePriceTx.isPrompting || updatePriceTx.isPending}
              onClick={() => {
                updatePriceTx.execute({
                  address: contracts.bondingCurve,
                  abi: ABIS.bondingCurve,
                  functionName: "updatePrice",
                  args: [],
                });
              }}
              className="w-full rounded-lg bg-background py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
            >
              {updatePriceTx.isPrompting || updatePriceTx.isPending
                ? "Updating..."
                : "Update Price"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
