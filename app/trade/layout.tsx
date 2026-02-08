import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade | Stable Markets Protocol",
  description: "Mint and redeem USDX stablecoins via bonding curves.",
};

export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
