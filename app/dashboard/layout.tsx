import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Bank of ETH",
  description: "Protocol health metrics, collateralization ratio, and market parameters.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
