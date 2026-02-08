import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TokenInput } from "../shared/TokenInput";
import { parseUnits } from "viem";

describe("TokenInput", () => {
  const defaultProps = {
    token: "ETH" as const,
    value: "",
    onChange: vi.fn(),
  };

  it("renders with token symbol", () => {
    render(<TokenInput {...defaultProps} />);
    expect(screen.getByText("ETH")).toBeInTheDocument();
  });

  it("renders USDX token", () => {
    render(<TokenInput {...defaultProps} token="USDX" />);
    expect(screen.getByText("USDX")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<TokenInput {...defaultProps} label="You pay" />);
    expect(screen.getByText("You pay")).toBeInTheDocument();
  });

  it("shows placeholder 0", () => {
    render(<TokenInput {...defaultProps} />);
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
  });

  it("calls onChange with valid numeric input", () => {
    const onChange = vi.fn();
    render(<TokenInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "123.45" } });
    expect(onChange).toHaveBeenCalledWith("123.45");
  });

  it("rejects non-numeric input", () => {
    const onChange = vi.fn();
    render(<TokenInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects multiple decimal points", () => {
    const onChange = vi.fn();
    render(<TokenInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "1.2.3" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("caps at 18 decimal places", () => {
    const onChange = vi.fn();
    render(<TokenInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    // 19 decimal places should be rejected
    fireEvent.change(input, {
      target: { value: "1." + "0".repeat(19) },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("allows empty input", () => {
    const onChange = vi.fn();
    render(<TokenInput {...defaultProps} onChange={onChange} value="123" />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows balance when provided", () => {
    const balance = parseUnits("10.5", 18);
    render(<TokenInput {...defaultProps} balance={balance} />);
    expect(screen.getByText(/Balance:/)).toBeInTheDocument();
    expect(screen.getByText(/10\.5/)).toBeInTheDocument();
  });

  it("shows MAX button when balance > 0", () => {
    const balance = parseUnits("10", 18);
    render(<TokenInput {...defaultProps} balance={balance} />);
    expect(screen.getByText("MAX")).toBeInTheDocument();
  });

  it("does not show MAX button when balance is 0", () => {
    render(<TokenInput {...defaultProps} balance={0n} />);
    expect(screen.queryByText("MAX")).not.toBeInTheDocument();
  });

  it("does not show MAX button when disabled", () => {
    const balance = parseUnits("10", 18);
    render(<TokenInput {...defaultProps} balance={balance} disabled />);
    expect(screen.queryByText("MAX")).not.toBeInTheDocument();
  });

  it("does not show MAX button when showMax=false", () => {
    const balance = parseUnits("10", 18);
    render(<TokenInput {...defaultProps} balance={balance} showMax={false} />);
    expect(screen.queryByText("MAX")).not.toBeInTheDocument();
  });

  it("calls onChange with full balance on MAX click", () => {
    const onChange = vi.fn();
    const balance = parseUnits("10.5", 18);
    render(<TokenInput {...defaultProps} onChange={onChange} balance={balance} />);
    fireEvent.click(screen.getByText("MAX"));
    expect(onChange).toHaveBeenCalledWith("10.5");
  });

  it("shows USD value when provided", () => {
    render(<TokenInput {...defaultProps} usdValue="~$1,234.00" />);
    expect(screen.getByText("~$1,234.00")).toBeInTheDocument();
  });

  it("disables input when disabled prop is true", () => {
    render(<TokenInput {...defaultProps} disabled />);
    const input = screen.getByPlaceholderText("0");
    expect(input).toBeDisabled();
  });
});
