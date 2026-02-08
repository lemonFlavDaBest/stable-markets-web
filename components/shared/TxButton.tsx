"use client";

import { type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export type ButtonVariant = "primary" | "secondary" | "danger";

interface TxButtonProps {
  /** Button label when ready to execute */
  children: ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Override disabled state */
  disabled?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Loading text override */
  loadingText?: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Full width */
  fullWidth?: boolean;
  /** Custom override label (overrides all state logic) */
  overrideLabel?: string;
  /** Whether the user needs to connect wallet first */
  requiresWallet?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-[0_0_20px_var(--color-primary-glow)] hover:shadow-[0_0_30px_var(--color-primary-glow)]",
  secondary:
    "bg-card text-text-primary border border-border hover:bg-card-hover hover:border-border-hover",
  danger:
    "bg-error/10 text-error border border-error/30 hover:bg-error/20",
};

/**
 * Multi-state transaction button with:
 * - "Connect Wallet" when not connected
 * - Loading spinner with custom text
 * - Red glow on primary variant
 * - Disabled states
 */
export function TxButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  variant = "primary",
  fullWidth = true,
  overrideLabel,
  requiresWallet = true,
}: TxButtonProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // If wallet required but not connected, show connect button
  if (requiresWallet && !isConnected) {
    return (
      <button
        type="button"
        onClick={() => openConnectModal?.()}
        className={`flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold transition-all ${
          VARIANT_STYLES.primary
        } ${fullWidth ? "w-full" : ""}`}
      >
        Connect Wallet
      </button>
    );
  }

  const isDisabled = disabled || loading;
  const label = overrideLabel ?? children;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all ${
        VARIANT_STYLES[variant]
      } ${fullWidth ? "w-full" : ""} ${
        isDisabled
          ? "cursor-not-allowed opacity-50 shadow-none"
          : "cursor-pointer"
      }`}
    >
      {loading && (
        <svg
          className="h-5 w-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {loading ? (loadingText ?? "Confirming...") : label}
    </button>
  );
}
