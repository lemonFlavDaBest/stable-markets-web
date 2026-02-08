import { create } from "zustand";
import { type Address } from "viem";
import { DEFAULT_SLIPPAGE_BPS, ZERO_ADDRESS } from "@/lib/constants";

interface UIState {
  // Slippage
  slippageBps: number;
  setSlippageBps: (bps: number) => void;

  // Trade tabs
  tradeTab: "mint" | "redeem";
  setTradeTab: (tab: "mint" | "redeem") => void;

  // Stake tabs
  stakeTab: "stake" | "unstake";
  setStakeTab: (tab: "stake" | "unstake") => void;

  // Referrer (from URL ?ref=0x...)
  referrer: Address;
  setReferrer: (addr: Address) => void;

  // Dismissed warning keys
  dismissedWarnings: Set<string>;
  dismissWarning: (key: string) => void;
  resetWarnings: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  slippageBps: DEFAULT_SLIPPAGE_BPS,
  setSlippageBps: (bps) => set({ slippageBps: bps }),

  tradeTab: "mint",
  setTradeTab: (tab) => set({ tradeTab: tab }),

  stakeTab: "stake",
  setStakeTab: (tab) => set({ stakeTab: tab }),

  referrer: ZERO_ADDRESS as Address,
  setReferrer: (addr) => set({ referrer: addr }),

  dismissedWarnings: new Set(),
  dismissWarning: (key) =>
    set((state) => ({
      dismissedWarnings: new Set([...state.dismissedWarnings, key]),
    })),
  resetWarnings: () => set({ dismissedWarnings: new Set() }),
}));
