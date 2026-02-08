"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#111111",
          border: "1px solid #1f1f1f",
          color: "#fafafa",
          fontFamily: "var(--font-share-tech-mono), monospace",
        },
      }}
      richColors
      closeButton
    />
  );
}
