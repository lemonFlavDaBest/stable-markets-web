"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV_ITEMS = [
  { label: "Trade", href: "/trade" },
  { label: "Stake", href: "/stake" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo — text only */}
        <Link href="/" className="text-lg font-semibold text-text-primary">
          BoE
        </Link>

        {/* Nav pills — hidden on mobile, shown on md+ */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-card p-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet connect */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
    </header>
  );
}
