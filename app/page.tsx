import Link from "next/link";

/** Ethereum diamond SVG — white fill with subtle glow */
function EthDiamond({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 256 417"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="rgba(255,255,255,0.9)" />
      <path d="M127.962 0L0 212.32L127.962 287.958V154.158V0Z" fill="rgba(255,255,255,0.7)" />
      <path d="M127.961 312.187L126.386 314.106V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="rgba(255,255,255,0.9)" />
      <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="rgba(255,255,255,0.7)" />
      <path d="M127.961 287.958L255.923 212.32L127.961 154.158V287.958Z" fill="rgba(255,255,255,1)" />
      <path d="M0 212.32L127.962 287.958V154.158L0 212.32Z" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}


export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 md:py-32">
      {/* Hero */}
      <div className="relative flex flex-col items-center text-center">
        {/* Glow effect behind the heading */}
        <div className="absolute -top-20 h-40 w-80 rounded-full bg-primary/10 blur-3xl" />

        {/* Ethereum diamond logo */}
        <EthDiamond className="relative mb-8 h-20 w-20 drop-shadow-[0_0_20px_rgba(147,187,255,0.4)] md:h-28 md:w-28" />

        <h1 className="relative text-5xl font-bold leading-tight text-text-primary sm:text-6xl md:text-7xl">
          BoE
        </h1>

        <p className="relative mt-4 text-2xl font-semibold tracking-wider text-text-secondary sm:text-3xl" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
          Bank of ETH
        </p>

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
