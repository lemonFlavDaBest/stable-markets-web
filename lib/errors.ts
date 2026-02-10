/**
 * Maps contract custom error names to user-friendly messages.
 * Error names come from the ABI — viem parses them automatically.
 */
export const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  // BondingCurveCore errors
  OracleStale: "Oracle price is stale. An update is needed before trading.",
  VolumeCapExceeded: "Volume cap reached. Wait for the next oracle update.",
  CriticalCR: "Redemptions paused — collateralization ratio is critically low.",
  SlippageExceeded: "Price moved unfavorably. Try increasing your slippage tolerance.",
  BelowMinimumTrade: "Trade amount is below the minimum ($10).",
  ProtocolPaused: "Protocol is currently paused by the admin.",
  InsufficientReserves: "Not enough reserves to fulfill this redemption.",
  NotBootstrapped: "Protocol has not been bootstrapped yet.",
  AlreadyBootstrapped: "Protocol has already been bootstrapped.",
  InsufficientBootstrap: "Insufficient ETH for bootstrap.",
  InvalidOraclePrice: "Oracle returned an invalid price.",
  OraclePriceOutOfBounds: "Oracle price is outside acceptable bounds.",
  TransferFailed: "ETH transfer failed. Please try again.",

  // StakingRewards errors
  StakingCapExceeded: "Staking cap reached. Try a smaller amount.",
  CooldownNotElapsed: "Cooldown period has not completed yet.",
  InsufficientStake: "Insufficient staked balance.",
  NoRewardsToClaim: "No pending rewards to claim.",
  InvalidUnstakeRequest: "This unstake request is invalid or already completed.",
  RequestNotExpired: "This unstake request has not expired yet.",
  TooManyUnstakeRequests: "Too many pending unstake requests. Complete or clean up existing ones.",
  BelowMinimum: "Amount is below the minimum stake.",

  // Shared errors
  Unauthorized: "You are not authorized to perform this action.",
  InvalidParameter: "Invalid parameter provided.",
  ReentrancyGuardReentrantCall: "Transaction rejected — reentrancy detected.",

  // ERC20 errors
  ERC20InsufficientBalance: "Insufficient token balance.",
  ERC20InsufficientAllowance: "Token approval needed before this transaction.",
  ERC20InvalidApprover: "Invalid token approver.",
  ERC20InvalidReceiver: "Invalid token receiver.",
  ERC20InvalidSender: "Invalid token sender.",
  ERC20InvalidSpender: "Invalid token spender.",
  OnlyMinter: "Only the minter contract can perform this action.",

  // Owner errors
  OwnableInvalidOwner: "Invalid owner address.",
  OwnableUnauthorizedAccount: "Caller is not the contract owner.",
  NoStakers: "No stakers in the pool.",
};

/**
 * Parse a contract error into a user-friendly message.
 * Handles viem's ContractFunctionRevertedError and generic errors.
 */
export function parseContractError(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  // Handle viem's ContractFunctionRevertedError which has a data.errorName
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // viem contract error shape
    if (err.data && typeof err.data === "object") {
      const data = err.data as Record<string, unknown>;
      if (typeof data.errorName === "string") {
        const message = CONTRACT_ERROR_MESSAGES[data.errorName];
        if (message) return message;
        return `Contract error: ${data.errorName}`;
      }
    }

    // Check shortMessage (viem pattern)
    if (typeof err.shortMessage === "string") {
      // Try to extract error name from shortMessage
      const nameMatch = err.shortMessage.match(/error (\w+)\(/);
      if (nameMatch) {
        const message = CONTRACT_ERROR_MESSAGES[nameMatch[1]];
        if (message) return message;
      }
      return err.shortMessage;
    }

    // Standard Error
    if (typeof err.message === "string") {
      // User rejected in wallet
      if (
        err.message.includes("User rejected") ||
        err.message.includes("user rejected")
      ) {
        return "Transaction rejected in wallet.";
      }
      // Insufficient funds for gas
      if (err.message.includes("insufficient funds")) {
        return "Insufficient ETH for gas fees.";
      }
      return err.message;
    }
  }

  if (typeof error === "string") return error;

  return "An unexpected error occurred. Please try again.";
}
