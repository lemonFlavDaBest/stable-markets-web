"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { getContracts } from "@/lib/contracts";
import { formatAddress } from "@/lib/format";
import { DEFAULT_CHAIN_ID, etherscanAddressUrl } from "@/lib/constants";

const CONTRACT_LABELS = [
  { key: "stableCoin", label: "StableCoin (USDX)" },
  { key: "bondingCurve", label: "BondingCurveCore" },
  { key: "reserveManager", label: "ReserveManager" },
  { key: "stakingRewards", label: "StakingRewards" },
] as const;

/**
 * Shows the 4 contract addresses with copy-to-clipboard and etherscan links.
 */
export function ContractAddresses() {
  const { chainId } = useAccount();
  const cid = chainId ?? DEFAULT_CHAIN_ID;
  const contracts = getContracts(cid);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <h3 className="border-b border-border px-4 py-3 text-sm font-medium text-text-muted">
        Contract Addresses
      </h3>
      <div className="divide-y divide-border">
        {CONTRACT_LABELS.map(({ key, label }) => {
          const address = contracts[key as keyof typeof contracts];
          const explorerUrl = etherscanAddressUrl(cid, address);

          return (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm text-text-secondary">{label}</p>
                <p className="font-mono text-xs text-text-muted">
                  {formatAddress(address, 6)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(key, address)}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-background hover:text-text-secondary"
                  title="Copy address"
                >
                  {copiedKey === key ? (
                    <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                  )}
                </button>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-background hover:text-text-secondary"
                    title="View on Etherscan"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
