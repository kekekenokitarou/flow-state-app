"use client"

import { signOut } from "next-auth/react"

export function LogoutButton({ isFlow }: { isFlow: boolean }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-700 ${
        isFlow
          ? "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
          : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
      }`}
    >
      ログアウト
    </button>
  )
}
