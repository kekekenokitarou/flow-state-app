"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FlameButton } from "@/components/FlameButton";
import { ProfileCard } from "@/components/ProfileCard";
import { LogoutButton } from "@/components/LogoutButton";
import { useFlowState } from "@/hooks/useFlowState";
import { cn } from "@/lib/utils";

interface FlowScreenProps {
  message: string;
}

export function FlowScreen({ message }: FlowScreenProps) {
  const { isFlow, toggle } = useFlowState();

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden",
        "transition-colors duration-700",
        isFlow ? "bg-neutral-950" : "bg-white"
      )}
    >
      {/* Radial glow backdrop — flow state only */}
      <AnimatePresence>
        {isFlow && (
          <motion.div
            key="glow"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="animate-glow-pulse h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(23, 22, 21, 0.18)_0%,transparent_70%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile & Logout — top right */}
      <div className="absolute top-5 right-5 z-10 flex items-center gap-3">
        <LogoutButton isFlow={isFlow} />
        <ProfileCard isFlow={isFlow} name="Keisuke" initial="K" />
      </div>

      {/* Flame button — center */}
      <FlameButton isFlow={isFlow} onClick={toggle} />

      {/* API message */}
      <div
        className={cn(
          "absolute bottom-6 left-6 rounded-xl px-3 py-2 text-xs",
          "border backdrop-blur transition-colors duration-700",
          isFlow
            ? "border-white/10 bg-white/5 text-zinc-200"
            : "border-zinc-200 bg-white text-zinc-700"
        )}
      >
        API: {message}
      </div>

      {/* Subtle vignette in flow state */}
      <AnimatePresence>
        {isFlow && (
          <motion.div
            key="vignette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
