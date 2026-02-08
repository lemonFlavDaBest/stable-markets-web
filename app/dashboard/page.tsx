"use client";

import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { MarketParams } from "@/components/dashboard/MarketParams";
import { ContractAddresses } from "@/components/dashboard/ContractAddresses";
import { WarningBanner } from "@/components/shared/WarningBanner";

export default function DashboardPage() {
  return (
    <>
      <WarningBanner />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:py-12">
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
        <StatsGrid />
        <div className="grid gap-6 md:grid-cols-2">
          <MarketParams />
          <ContractAddresses />
        </div>
      </div>
    </>
  );
}
