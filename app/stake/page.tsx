"use client";

import { PositionCard } from "@/components/stake/PositionCard";
import { StakeCard } from "@/components/stake/StakeCard";
import { UnstakeQueue } from "@/components/stake/UnstakeQueue";
import { WarningBanner } from "@/components/shared/WarningBanner";

export default function StakePage() {
  return (
    <>
      <WarningBanner />
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-8 md:py-12">
        <PositionCard />
        <StakeCard />
        <UnstakeQueue />
      </div>
    </>
  );
}
