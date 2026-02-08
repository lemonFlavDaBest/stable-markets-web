import { describe, it, expect } from "vitest";
import {
  formatUSD,
  formatETH,
  formatUSDX,
  formatNumber,
  formatPercent,
  formatCR,
  formatAddress,
  formatTimeRemaining,
  formatTimestamp,
  parseTokenInput,
} from "../format";
import { parseUnits } from "viem";

describe("formatUSD", () => {
  it("formats zero", () => {
    expect(formatUSD(0n)).toBe("$0.00");
  });

  it("formats whole numbers", () => {
    const val = parseUnits("1234", 18);
    expect(formatUSD(val)).toBe("$1,234.00");
  });

  it("formats decimals", () => {
    const val = parseUnits("1234.56", 18);
    expect(formatUSD(val)).toBe("$1,234.56");
  });

  it("formats large values", () => {
    const val = parseUnits("1000000", 18);
    expect(formatUSD(val)).toBe("$1,000,000.00");
  });

  it("formats small values", () => {
    const val = parseUnits("0.01", 18);
    expect(formatUSD(val)).toBe("$0.01");
  });
});

describe("formatETH", () => {
  it("formats zero", () => {
    expect(formatETH(0n)).toBe("0 ETH");
  });

  it("formats with default 4 decimals", () => {
    const val = parseUnits("1.23456789", 18);
    expect(formatETH(val)).toBe("1.2346 ETH");
  });

  it("formats whole ETH", () => {
    const val = parseUnits("10", 18);
    expect(formatETH(val)).toBe("10 ETH");
  });

  it("respects maxDecimals", () => {
    const val = parseUnits("1.23456789", 18);
    expect(formatETH(val, 2)).toBe("1.23 ETH");
  });
});

describe("formatUSDX", () => {
  it("formats zero", () => {
    expect(formatUSDX(0n)).toBe("0 USDX");
  });

  it("formats with 2 decimals by default", () => {
    const val = parseUnits("990.1234", 18);
    expect(formatUSDX(val)).toBe("990.12 USDX");
  });

  it("formats with 0 decimals", () => {
    const val = parseUnits("1000", 18);
    expect(formatUSDX(val, 0)).toBe("1,000 USDX");
  });
});

describe("formatNumber", () => {
  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats integers", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formats decimals up to maxDecimals", () => {
    expect(formatNumber(1.23456789, 4)).toBe("1.2346");
  });

  it("does not add trailing zeros", () => {
    expect(formatNumber(1.1, 4)).toBe("1.1");
  });

  it("handles very small numbers with scientific notation", () => {
    const result = formatNumber(0.00001, 4);
    expect(result).toContain("e");
  });
});

describe("formatPercent", () => {
  it("formats basic percentage", () => {
    expect(formatPercent(12.34)).toBe("12.34%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0%");
  });

  it("formats with custom decimals", () => {
    expect(formatPercent(99.999, 1)).toBe("100%");
  });
});

describe("formatCR", () => {
  it("returns success for CR > 150%", () => {
    const result = formatCR(160n); // 160%
    expect(result.color).toBe("success");
    expect(result.text).toContain("160");
  });

  it("returns warning for CR between 120-150%", () => {
    const result = formatCR(130n); // 130%
    expect(result.color).toBe("warning");
    expect(result.text).toContain("130");
  });

  it("returns error for CR < 120%", () => {
    const result = formatCR(110n); // 110%
    expect(result.color).toBe("error");
    expect(result.text).toContain("110");
  });

  it("handles zero CR", () => {
    const result = formatCR(0n);
    expect(result.color).toBe("error");
    expect(result.text).toContain("0");
  });

  it("handles typical Sepolia value", () => {
    const result = formatCR(99n); // 99% — under-collateralized
    expect(result.color).toBe("error");
    expect(result.text).toContain("99");
  });
});

describe("formatAddress", () => {
  it("truncates address", () => {
    expect(formatAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234...5678"
    );
  });

  it("custom char count", () => {
    expect(
      formatAddress("0x1234567890abcdef1234567890abcdef12345678", 6)
    ).toBe("0x123456...345678");
  });

  it("returns short strings unchanged", () => {
    expect(formatAddress("0x1234")).toBe("0x1234");
  });

  it("handles empty string", () => {
    expect(formatAddress("")).toBe("");
  });
});

describe("formatTimeRemaining", () => {
  it("returns Ready for zero", () => {
    expect(formatTimeRemaining(0)).toBe("Ready");
  });

  it("returns Ready for negative", () => {
    expect(formatTimeRemaining(-100)).toBe("Ready");
  });

  it("formats minutes only", () => {
    expect(formatTimeRemaining(300)).toBe("5m");
  });

  it("formats hours and minutes", () => {
    expect(formatTimeRemaining(3700)).toBe("1h 1m");
  });

  it("formats days, hours, minutes", () => {
    expect(formatTimeRemaining(90061)).toBe("1d 1h 1m");
  });

  it("formats exactly 14 days", () => {
    expect(formatTimeRemaining(14 * 86400)).toBe("14d");
  });
});

describe("formatTimestamp", () => {
  it("formats a Unix timestamp", () => {
    // Jan 1, 2024 00:00 UTC
    const result = formatTimestamp(1704067200);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});

describe("parseTokenInput", () => {
  it("parses empty string to 0n", () => {
    expect(parseTokenInput("")).toBe(0n);
  });

  it("parses whole numbers", () => {
    expect(parseTokenInput("100")).toBe(parseUnits("100", 18));
  });

  it("parses decimals", () => {
    expect(parseTokenInput("1.5")).toBe(parseUnits("1.5", 18));
  });

  it("parses strings with commas", () => {
    expect(parseTokenInput("1,000.5")).toBe(parseUnits("1000.5", 18));
  });

  it("rejects scientific notation", () => {
    expect(parseTokenInput("1e18")).toBe(0n);
    expect(parseTokenInput("1E18")).toBe(0n);
  });

  it("rejects negative numbers", () => {
    expect(parseTokenInput("-1")).toBe(0n);
  });

  it("handles max 18 decimals", () => {
    const input = "1." + "1".repeat(20);
    const result = parseTokenInput(input);
    // Should cap at 18 decimals
    expect(result).toBe(parseUnits("1." + "1".repeat(18), 18));
  });

  it("handles zero decimal places", () => {
    expect(parseTokenInput("42")).toBe(parseUnits("42", 18));
  });

  it("handles leading decimal", () => {
    expect(parseTokenInput(".5")).toBe(parseUnits("0.5", 18));
  });

  it("handles trailing decimal", () => {
    // "1." should parse as 1.0
    expect(parseTokenInput("1.")).toBe(parseUnits("1", 18));
  });

  it("handles spaces", () => {
    expect(parseTokenInput(" 100 ")).toBe(parseUnits("100", 18));
  });

  it("returns 0n for garbage input", () => {
    expect(parseTokenInput("abc")).toBe(0n);
  });

  it("uses custom decimals", () => {
    expect(parseTokenInput("1", 6)).toBe(1000000n);
  });
});
