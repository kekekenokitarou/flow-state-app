"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FLOW_LABELS, FLOW_ARIA } from "@/constants/flow";

// ---------------------------------------------------------------------------
// FlameIcon (internal sub-component)
// ---------------------------------------------------------------------------
interface FlameIconProps {
  isFlow: boolean;
}

function FlameIcon({ isFlow }: FlameIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 80"
      width="120"
      height="150"
      fill="none"
      aria-hidden="true"
    >
      {/* outer flame */}
      <path
        d="M32 4 C32 4 48 20 48 36 C48 50 40 60 32 64 C24 60 16 50 16 36 C16 20 32 4 32 4Z"
        fill={isFlow ? "#ff6a00" : "#a1a1aa"}
        style={{ transition: "fill 0.7s ease" }}
      />
      {/* mid flame */}
      <path
        d="M32 18 C32 18 42 30 42 40 C42 50 37 56 32 58 C27 56 22 50 22 40 C22 30 32 18 32 18Z"
        fill={isFlow ? "#ff9500" : "#d4d4d8"}
        style={{ transition: "fill 0.7s ease" }}
      />
      {/* inner core */}
      <path
        d="M32 32 C32 32 37 38 37 44 C37 49 35 52 32 53 C29 52 27 49 27 44 C27 38 32 32 32 32Z"
        fill={isFlow ? "#ffe066" : "#f4f4f5"}
        style={{ transition: "fill 0.7s ease" }}
      />
      {/* base glow — only in flow */}
      <AnimatePresence>
        {isFlow && (
          <motion.ellipse
            cx="32"
            cy="64"
            rx="18"
            ry="5"
            fill="#ff6a00"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 0.4, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FlameButton (exported)
// ---------------------------------------------------------------------------
interface FlameButtonProps {
  isFlow: boolean;
  onClick: () => void;
}

export function FlameButton({ isFlow, onClick }: FlameButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative flex flex-col items-center gap-4 cursor-pointer select-none focus:outline-none"
      aria-label={isFlow ? FLOW_ARIA.end : FLOW_ARIA.start}
    >
      {/* Flame wrapper — wobble only in flow */}
      <div className={cn(isFlow && "animate-flame")}>
        <FlameIcon isFlow={isFlow} />
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isFlow ? "flow-label" : "idle-label"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "text-xs font-semibold tracking-[0.25em] uppercase",
            isFlow ? "text-orange-400" : "text-zinc-400"
          )}
        >
          {isFlow ? FLOW_LABELS.flow : FLOW_LABELS.idle}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
