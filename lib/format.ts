import { formatUnits } from "viem";
import { DECIMALS } from "./constants";

// ------------------------------------------------------------------
// Number formatting
// ------------------------------------------------------------------

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

/** Format a bigint (18 decimals) as USD: "$1,234.56" */
export function formatUSD(value: bigint, decimals = DECIMALS.USDX): string {
  const num = Number(formatUnits(value, decimals));
  return usdFormatter.format(num);
}

/** Format a bigint (18 decimals) as compact USD: "$1.23K" */
export function formatUSDCompact(value: bigint, decimals = DECIMALS.USDX): string {
  const num = Number(formatUnits(value, decimals));
  return "$" + compactFormatter.format(num);
}

/** Format a bigint as ETH: "1.234 ETH" */
export function formatETH(value: bigint, maxDecimals = 4): string {
  const num = Number(formatUnits(value, DECIMALS.ETH));
  return `${formatNumber(num, maxDecimals)} ETH`;
}

/** Format a bigint as USDX: "990.00 USDX" */
export function formatUSDX(value: bigint, maxDecimals = 2): string {
  const num = Number(formatUnits(value, DECIMALS.USDX));
  return `${formatNumber(num, maxDecimals)} USDX`;
}

/** Format a number with dynamic decimal places (no trailing zeros) */
export function formatNumber(value: number, maxDecimals = 4): string {
  if (value === 0) return "0";

  // For very small numbers, show more precision
  if (Math.abs(value) < 0.0001 && value !== 0) {
    return value.toExponential(2);
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/** Format a percentage from a raw number: "12.34%" */
export function formatPercent(value: number, maxDecimals = 2): string {
  return `${formatNumber(value, maxDecimals)}%`;
}

/**
 * Format collateralization ratio.
 * Contract returns raw percentage where 100 = 100%, 150 = 150%.
 * (PERCENTAGE_BASE = 100 in the contracts)
 */
export function formatCR(value: bigint): {
  text: string;
  color: "success" | "warning" | "error";
} {
  const percent = Number(value);
  const text = `${formatNumber(percent, 2)}%`;

  if (percent > 150) return { text, color: "success" };
  if (percent >= 120) return { text, color: "warning" };
  return { text, color: "error" };
}

// ------------------------------------------------------------------
// Address formatting
// ------------------------------------------------------------------

/** Truncate an address: "0x1234...5678" */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ------------------------------------------------------------------
// Time formatting
// ------------------------------------------------------------------

/** Format seconds remaining as "Xd Xh Xm" */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Ready";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

/** Format a Unix timestamp as a locale date string */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ------------------------------------------------------------------
// Input parsing
// ------------------------------------------------------------------

/**
 * Parse a user-entered token amount string to bigint (18 decimals).
 * Returns 0n for invalid input. Handles locale decimal separators.
 * Caps at 18 decimal places.
 */
export function parseTokenInput(input: string, decimals = 18): bigint {
  if (!input || input.trim() === "") return 0n;

  // Normalize: remove commas, spaces
  const cleaned = input.replace(/[,\s]/g, "");

  // Reject scientific notation
  if (cleaned.includes("e") || cleaned.includes("E")) return 0n;

  // Reject negative
  if (cleaned.startsWith("-")) return 0n;

  // Handle decimal
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) {
    // Whole number
    try {
      return BigInt(cleaned) * 10n ** BigInt(decimals);
    } catch {
      return 0n;
    }
  }

  const wholePart = cleaned.slice(0, dotIndex) || "0";
  let fracPart = cleaned.slice(dotIndex + 1);

  // Cap decimal places
  if (fracPart.length > decimals) {
    fracPart = fracPart.slice(0, decimals);
  }

  // Pad fractional part to full decimals
  fracPart = fracPart.padEnd(decimals, "0");

  try {
    return BigInt(wholePart) * 10n ** BigInt(decimals) + BigInt(fracPart);
  } catch {
    return 0n;
  }
}
