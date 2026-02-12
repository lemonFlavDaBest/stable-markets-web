import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stake | Bank of ETH",
  description: "Stake USDX to earn ETH rewards. 14-day cooldown unstaking.",
};

export default function StakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
