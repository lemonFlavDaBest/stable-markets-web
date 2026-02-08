import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 md:py-32">
      {/* Hero */}
      <div className="relative flex flex-col items-center text-center">
        {/* Glow effect behind the heading */}
        <div className="absolute -top-20 h-40 w-80 rounded-full bg-primary/10 blur-3xl" />

        <h1 className="relative text-5xl font-bold leading-tight text-text-primary sm:text-6xl md:text-7xl">
          Stable Markets
        </h1>

        <p className="relative mt-6 max-w-md text-lg text-text-secondary">
          Permissionless Stable Coin on Ethereum. Backed by ETH.
        </p>

        {/* CTA */}
        <Link
          href="/trade"
          className="relative mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-[0_0_30px_var(--color-primary-glow)] transition-all hover:bg-primary-hover hover:shadow-[0_0_40px_var(--color-primary-glow)]"
        >
          Launch App
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Stats teaser */}
      <div className="mt-20 grid grid-cols-3 gap-8 text-center md:gap-16">
        <div>
          <p className="font-mono text-2xl font-bold text-text-primary md:text-3xl">100%</p>
          <p className="mt-1 text-xs text-text-muted">On-chain</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-bold text-text-primary md:text-3xl">0%</p>
          <p className="mt-1 text-xs text-text-muted">Counterparty Risk</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-bold text-primary md:text-3xl">USDX</p>
          <p className="mt-1 text-xs text-text-muted">Stablecoin</p>
        </div>
      </div>
    </div>
  );
}
