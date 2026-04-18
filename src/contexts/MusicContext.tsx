"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAppleMusic, type UseAppleMusicReturn } from "@/hooks/useAppleMusic";

const MusicContext = createContext<UseAppleMusicReturn | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const music = useAppleMusic();
  return <MusicContext.Provider value={music}>{children}</MusicContext.Provider>;
}

export function useMusicContext(): UseAppleMusicReturn {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicContext must be used within MusicProvider");
  return ctx;
}
