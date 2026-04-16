"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "@/components/ProfileSettings";

interface HamburgerMenuProps {
  isFlow: boolean;
}

type MenuPage = "top" | "profile";

const NAV_ITEMS = [
  { id: "profile" as MenuPage, label: "プロフィール設定", icon: "👤" },
  // ここに今後の機能を追加していく
];

export function HamburgerMenu({ isFlow }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<MenuPage>("top");

  const panelBg = isFlow
    ? "bg-neutral-900/95 border-white/10 text-white"
    : "bg-white border-zinc-200 text-zinc-800";

  const itemHover = isFlow ? "hover:bg-white/5" : "hover:bg-zinc-50";
  const subText = isFlow ? "text-zinc-400" : "text-zinc-400";
  const divider = isFlow ? "border-white/10" : "border-zinc-100";

  function handleClose() {
    setOpen(false);
    setTimeout(() => setPage("top"), 300);
  }

  return (
    <div className="relative z-20">
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex flex-col gap-1.5 p-2 rounded-lg transition",
          isFlow ? "hover:bg-white/10" : "hover:bg-zinc-100"
        )}
        aria-label="メニューを開く"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={
              open
                ? i === 0
                  ? { rotate: 45, y: 8 }
                  : i === 1
                  ? { opacity: 0 }
                  : { rotate: -45, y: -8 }
                : { rotate: 0, y: 0, opacity: 1 }
            }
            transition={{ duration: 0.2 }}
            className={cn(
              "block h-0.5 w-5 rounded-full transition-colors duration-700",
              isFlow ? "bg-white" : "bg-zinc-800"
            )}
          />
        ))}
      </button>

      {/* オーバーレイ */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-10"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* サイドバー */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed top-0 left-0 h-full w-72 z-20 border-r shadow-2xl flex flex-col",
              panelBg
            )}
          >
            {/* ヘッダー */}
            <div className={cn("flex items-center justify-between px-5 py-5 border-b", divider)}>
              <AnimatePresence mode="wait">
                {page === "top" ? (
                  <motion.span
                    key="menu-title"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-bold tracking-widest uppercase"
                  >
                    Menu
                  </motion.span>
                ) : (
                  <motion.button
                    key="back-btn"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setPage("top")}
                    className={cn("flex items-center gap-2 text-sm font-medium", subText)}
                  >
                    ← 戻る
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                onClick={handleClose}
                className={cn("text-lg leading-none", subText)}
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {page === "top" ? (
                  <motion.nav
                    key="nav"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col py-3"
                  >
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={cn(
                          "flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-left transition",
                          itemHover
                        )}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </motion.nav>
                ) : (
                  <motion.div
                    key="profile-settings"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ProfileSettings isFlow={isFlow} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
