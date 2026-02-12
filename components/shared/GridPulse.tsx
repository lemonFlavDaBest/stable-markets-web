"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/ui";

const PULSE_DURATION_MS = 1200;

export function GridPulse() {
  const pulseKey = useUIStore((s) => s.pulseKey);
  const [activeKey, setActiveKey] = useState<number | null>(null);

  useEffect(() => {
    if (pulseKey === 0) return;
    setActiveKey(pulseKey);
    const timer = setTimeout(() => setActiveKey(null), PULSE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [pulseKey]);

  if (activeKey === null) return null;

  return <div key={activeKey} className="grid-pulse-overlay" />;
}
