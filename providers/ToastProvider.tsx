"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#15326e",
          border: "1px solid #2a4f9a",
          color: "#ffffff",
          fontFamily: "var(--font-share-tech-mono), monospace",
        },
      }}
      richColors
      closeButton
    />
  );
}
