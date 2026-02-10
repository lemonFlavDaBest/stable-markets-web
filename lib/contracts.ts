import { type Address, erc20Abi } from "viem";
import { mainnet, sepolia } from "wagmi/chains";

import bondingCurveAbi from "./abi/BondingCurveCore.json";
import stakingRewardsAbi from "./abi/StakingRewards.json";
import reserveManagerAbi from "./abi/ReserveManager.json";
import stableCoinAbi from "./abi/StableCoin.json";

// ------------------------------------------------------------------
// ABIs
// ------------------------------------------------------------------

export const ABIS = {
  erc20: erc20Abi,
  bondingCurve: bondingCurveAbi,
  stakingRewards: stakingRewardsAbi,
  reserveManager: reserveManagerAbi,
  stableCoin: stableCoinAbi,
} as const;

// ------------------------------------------------------------------
// Contract addresses per chain
// ------------------------------------------------------------------

export interface ContractAddresses {
  stableCoin: Address;
  bondingCurve: Address;
  reserveManager: Address;
  stakingRewards: Address;
}

/**
 * Addresses loaded from environment variables.
 * In production, these come from .env; in dev, from .env.local.
 */
const envAddresses: ContractAddresses = {
  stableCoin: (process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address,
  bondingCurve: (process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address,
  reserveManager: (process.env.NEXT_PUBLIC_RESERVE_MANAGER_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address,
  stakingRewards: (process.env.NEXT_PUBLIC_STAKING_REWARDS_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address,
};

export const CONTRACTS: Record<number, ContractAddresses> = {
  [mainnet.id]: envAddresses,
  [sepolia.id]: envAddresses,
};

/**
 * Get contract addresses for a given chain ID.
 * Falls back to env-configured addresses if chain isn't explicitly mapped.
 */
export function getContracts(chainId: number): ContractAddresses {
  return CONTRACTS[chainId] ?? envAddresses;
}

// ------------------------------------------------------------------
// Contract config helpers (for wagmi hooks)
// ------------------------------------------------------------------

export function bondingCurveContract(chainId: number) {
  return {
    address: getContracts(chainId).bondingCurve,
    abi: ABIS.bondingCurve,
  } as const;
}

export function stakingRewardsContract(chainId: number) {
  return {
    address: getContracts(chainId).stakingRewards,
    abi: ABIS.stakingRewards,
  } as const;
}

export function reserveManagerContract(chainId: number) {
  return {
    address: getContracts(chainId).reserveManager,
    abi: ABIS.reserveManager,
  } as const;
}

export function stableCoinContract(chainId: number) {
  return {
    address: getContracts(chainId).stableCoin,
    abi: ABIS.stableCoin,
  } as const;
}
