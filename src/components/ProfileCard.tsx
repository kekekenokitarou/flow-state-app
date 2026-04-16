"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FLOW_STATUS } from "@/constants/flow";

interface ProfileCardProps {
  isFlow: boolean;
  name: string;
  initial: string;
  image: string | null;
}

export function ProfileCard({ isFlow, name, initial, image }: ProfileCardProps) {
  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-2.5",
        "border transition-colors duration-700",
        isFlow
          ? "bg-white/5 border-white/10 backdrop-blur-md"
          : "bg-white border-zinc-200 shadow-sm"
      )}
    >
      {/* Avatar */}
      {image ? (
        <img
          src={image}
          alt={name}
          className={cn(
            "h-9 w-9 rounded-full object-cover transition-all duration-700",
            isFlow
              ? "ring-1 ring-orange-500/30"
              : "ring-1 ring-zinc-200"
          )}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "text-sm font-bold transition-colors duration-700",
            isFlow
              ? "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30"
              : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
          )}
        >
          {initial}
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-sm font-semibold transition-colors duration-700",
            isFlow ? "text-white" : "text-zinc-800"
          )}
        >
          {name}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={isFlow ? "flow" : "idle"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "text-xs",
              isFlow ? "text-orange-400" : "text-zinc-400"
            )}
          >
            {isFlow ? FLOW_STATUS.flow : FLOW_STATUS.idle}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Status dot */}
      <span
        className={cn(
          "ml-1 h-2 w-2 rounded-full transition-colors duration-700",
          isFlow
            ? "bg-orange-400 shadow-[0_0_6px_2px_rgba(251,146,60,0.6)]"
            : "bg-zinc-300"
        )}
      />
    </motion.div>
  );
}
