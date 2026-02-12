export function Footer() {
  return (
    <footer className="border-t border-border py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-xs text-text-muted sm:flex-row sm:justify-between">
        <span>Bank of ETH v0.1</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/lemonFlavDaBest/stable_markets"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-text-secondary"
          >
            GitHub
          </a>
          <a
            href="https://github.com/lemonFlavDaBest/stable_markets/tree/main/user-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-text-secondary"
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
