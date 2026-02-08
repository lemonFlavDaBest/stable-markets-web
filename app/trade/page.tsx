"use client";

import { Suspense } from "react";
import { TradeCard } from "@/components/trade/TradeCard";
import { ProtocolStatsBar } from "@/components/trade/ProtocolStatsBar";
import { WarningBanner } from "@/components/shared/WarningBanner";

export default function TradePage() {
  return (
    <>
      <WarningBanner />
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-8 md:py-12">
        <Suspense>
          <TradeCard />
        </Suspense>
        <ProtocolStatsBar />
      </div>
    </>
  );
}
