import type { Metadata } from "next";
import { Share_Tech_Mono, Orbitron, JetBrains_Mono } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
import { ToastProvider } from "@/providers/ToastProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stable Markets Protocol",
  description:
    "Mint and redeem USDX stablecoins via bonding curves. Stake to earn ETH rewards.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${shareTechMono.variable} ${orbitron.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Web3Provider>
          <div className="tron-grid flex min-h-screen flex-col relative">
            <Header />
            <main className="relative z-10 flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
          </div>
          <ToastProvider />
        </Web3Provider>
      </body>
    </html>
  );
}
