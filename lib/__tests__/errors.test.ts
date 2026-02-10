import { describe, it, expect } from "vitest";
import { parseContractError, CONTRACT_ERROR_MESSAGES } from "../errors";

describe("CONTRACT_ERROR_MESSAGES", () => {
  it("has entries for all major contract errors", () => {
    const expectedKeys = [
      "OracleStale",
      "VolumeCapExceeded",
      "CriticalCR",
      "SlippageExceeded",
      "BelowMinimumTrade",
      "ProtocolPaused",
      "StakingCapExceeded",
      "CooldownNotElapsed",
      "InsufficientStake",
      "ReentrancyGuardReentrantCall",
    ];

    for (const key of expectedKeys) {
      expect(CONTRACT_ERROR_MESSAGES).toHaveProperty(key);
      expect(typeof CONTRACT_ERROR_MESSAGES[key]).toBe("string");
    }
  });
});

describe("parseContractError", () => {
  it("handles null/undefined", () => {
    expect(parseContractError(null)).toBe("An unknown error occurred.");
    expect(parseContractError(undefined)).toBe("An unknown error occurred.");
  });

  it("handles string errors", () => {
    expect(parseContractError("Something broke")).toBe("Something broke");
  });

  it("parses viem ContractFunctionRevertedError with data.errorName", () => {
    const err = {
      data: {
        errorName: "OracleStale",
      },
    };
    expect(parseContractError(err)).toBe(CONTRACT_ERROR_MESSAGES.OracleStale);
  });

  it("parses unknown error names from data", () => {
    const err = {
      data: {
        errorName: "SomeNewError",
      },
    };
    expect(parseContractError(err)).toBe("Contract error: SomeNewError");
  });

  it("parses shortMessage with error name pattern", () => {
    const err = {
      shortMessage: 'The contract function "mint" reverted with error VolumeCapExceeded()',
    };
    expect(parseContractError(err)).toBe(CONTRACT_ERROR_MESSAGES.VolumeCapExceeded);
  });

  it("falls back to shortMessage when no pattern match", () => {
    const err = {
      shortMessage: "Some generic error happened",
    };
    expect(parseContractError(err)).toBe("Some generic error happened");
  });

  it("detects user rejection", () => {
    const err = {
      message: "User rejected the request.",
    };
    expect(parseContractError(err)).toBe("Transaction rejected in wallet.");
  });

  it("detects insufficient funds for gas", () => {
    const err = {
      message: "insufficient funds for gas",
    };
    expect(parseContractError(err)).toBe("Insufficient ETH for gas fees.");
  });

  it("falls back to error message", () => {
    const err = {
      message: "Some random error",
    };
    expect(parseContractError(err)).toBe("Some random error");
  });

  it("handles non-object non-string types", () => {
    expect(parseContractError(42)).toBe("An unexpected error occurred. Please try again.");
  });

  it("prioritizes data.errorName over shortMessage", () => {
    const err = {
      data: { errorName: "CriticalCR" },
      shortMessage: "Something else",
    };
    expect(parseContractError(err)).toBe(CONTRACT_ERROR_MESSAGES.CriticalCR);
  });
});
