"use client";

import { ScrollProvider } from "@/lib/context/ScrollContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ScrollProvider>
      {children}
    </ScrollProvider>
  );
}
