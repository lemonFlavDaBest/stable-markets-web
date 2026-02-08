"use client";

import { type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// ------------------------------------------------------------------
// wagmi config
// ------------------------------------------------------------------

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.sepolia.org";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  ssr: true,
});

// ------------------------------------------------------------------
// React Query
// ------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus for blockchain data — we use intervals
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 10_000,
    },
  },
});

// ------------------------------------------------------------------
// RainbowKit theme — dark with red accents
// ------------------------------------------------------------------

const customTheme: Theme = {
  ...darkTheme({
    accentColor: "#dc2626",
    accentColorForeground: "#fafafa",
    borderRadius: "medium",
  }),
  colors: {
    ...darkTheme().colors,
    modalBackground: "#111111",
    modalBorder: "#1f1f1f",
    profileForeground: "#111111",
    connectButtonBackground: "#111111",
    connectButtonInnerBackground: "#0a0a0a",
    connectButtonText: "#fafafa",
  },
  fonts: {
    body: "var(--font-share-tech-mono), monospace",
  },
};

// ------------------------------------------------------------------
// Provider component
// ------------------------------------------------------------------

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
