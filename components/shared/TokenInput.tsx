"use client";

import { type ChangeEvent, useCallback } from "react";
import { formatUnits } from "viem";
import { formatNumber } from "@/lib/format";

interface TokenInputProps {
  /** Token symbol to display: "ETH" or "USDX" */
  token: "ETH" | "USDX";
  /** Current input value (string for controlled input) */
  value: string;
  /** Called when user types — receives raw string */
  onChange: (value: string) => void;
  /** User's wallet balance for this token (18 decimals) */
  balance?: bigint;
  /** USD equivalent to show below input */
  usdValue?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Label above the input */
  label?: string;
  /** If true, show the MAX button */
  showMax?: boolean;
}

/**
 * Token amount input with:
 * - Token icon/name
 * - Numeric input (safe for 18 decimal tokens)
 * - Balance display + MAX button
 * - USD equivalent line
 */
export function TokenInput({
  token,
  value,
  onChange,
  balance,
  usdValue,
  disabled = false,
  label,
  showMax = true,
}: TokenInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow empty, numbers, and single decimal point only
      if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
        // Cap at 18 decimal places
        const dotIndex = raw.indexOf(".");
        if (dotIndex !== -1 && raw.length - dotIndex - 1 > 18) return;

        onChange(raw);
      }
    },
    [onChange]
  );

  const handleMax = useCallback(() => {
    if (balance === undefined || balance === 0n) return;
    // Format balance to string, trimming trailing zeros
    const formatted = formatUnits(balance, 18);
    // Remove trailing zeros after decimal
    const trimmed = formatted.includes(".")
      ? formatted.replace(/0+$/, "").replace(/\.$/, "")
      : formatted;
    onChange(trimmed);
  }, [balance, onChange]);

  // ETH shows 3 decimals (e.g. 0.001), USDX shows 2 (stablecoin)
  const balanceDecimals = token === "ETH" ? 3 : 2;
  const formattedBalance = balance !== undefined
    ? formatNumber(Number(formatUnits(balance, 18)), balanceDecimals)
    : undefined;

  return (
    <div className="rounded-xl border border-border bg-background p-4 transition-colors focus-within:border-border-accent">
      {/* Label row */}
      {label && (
        <label className="mb-2 block text-xs text-text-muted">{label}</label>
      )}

      {/* Input row */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          placeholder="0"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent font-mono text-2xl text-text-primary outline-none placeholder:text-text-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Token badge */}
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-card px-3 py-1.5">
          <div
            className={`h-5 w-5 rounded-full ${
              token === "ETH"
                ? "bg-blue-500"
                : "bg-primary"
            }`}
          />
          <span className="text-sm font-medium text-text-primary">
            {token}
          </span>
        </div>
      </div>

      {/* Bottom row: USD value + balance */}
      <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
        <span>{usdValue ?? "\u00A0"}</span>
        {formattedBalance !== undefined && (
          <div className="flex items-center gap-1">
            <span>Balance: {formattedBalance}</span>
            {showMax && balance !== undefined && balance > 0n && !disabled && (
              <button
                type="button"
                onClick={handleMax}
                className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
