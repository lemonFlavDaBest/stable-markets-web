import { mainnet, sepolia } from "wagmi/chains";

// ------------------------------------------------------------------
// Chain configuration
// ------------------------------------------------------------------

/** Supported chain IDs */
export const SUPPORTED_CHAIN_IDS = [mainnet.id, sepolia.id] as const;

/** Default chain based on env */
export const DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? sepolia.id
);

// ------------------------------------------------------------------
// Slippage
// ------------------------------------------------------------------

export const SLIPPAGE_OPTIONS = [
  { label: "0.1%", value: 10 },   // basis points
  { label: "0.5%", value: 50 },
  { label: "1.0%", value: 100 },
] as const;

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const MAX_SLIPPAGE_BPS = 5000;   // 50% (sanity cap)
export const BASIS_POINTS = 10_000n;

// ------------------------------------------------------------------
// Refetch intervals (ms)
// ------------------------------------------------------------------

export const REFETCH_INTERVAL = {
  /** Per-block data: balances, prices */
  FAST: 12_000,
  /** Protocol stats: CR, TVL, supply */
  MEDIUM: 30_000,
  /** Staking queue, dashboard */
  SLOW: 60_000,
  /** Quote recalculation when user isn't typing */
  QUOTE: 15_000,
} as const;

// ------------------------------------------------------------------
// Trade limits
// ------------------------------------------------------------------

/** Minimum trade size in USD (for UI validation) */
export const MIN_TRADE_USD = 10;

/** Token decimals */
export const DECIMALS = {
  ETH: 18,
  USDX: 18,
  /** Chainlink oracle price feed decimals */
  PRICE: 8,
} as const;

/** Contract PERCENTAGE_BASE — 100 = 100% */
export const PERCENTAGE_BASE = 100;

// ------------------------------------------------------------------
// Staking
// ------------------------------------------------------------------

/** Base cooldown period in seconds (14 days) */
export const BASE_COOLDOWN_SECONDS = 14 * 24 * 60 * 60;

// ------------------------------------------------------------------
// External links
// ------------------------------------------------------------------

export const ETHERSCAN_BASE_URL: Record<number, string> = {
  [mainnet.id]: "https://etherscan.io",
  [sepolia.id]: "https://sepolia.etherscan.io",
};

/** Build an etherscan URL for a tx hash */
export function etherscanTxUrl(chainId: number, hash: string): string {
  const base = ETHERSCAN_BASE_URL[chainId];
  if (!base) return "";
  return `${base}/tx/${hash}`;
}

/** Build an etherscan URL for an address */
export function etherscanAddressUrl(chainId: number, address: string): string {
  const base = ETHERSCAN_BASE_URL[chainId];
  if (!base) return "";
  return `${base}/address/${address}`;
}

// ------------------------------------------------------------------
// UI
// ------------------------------------------------------------------

/** Zero address used as default referrer */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
