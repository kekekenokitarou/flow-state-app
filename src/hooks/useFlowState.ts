import { useState, useCallback, useRef } from "react";
import { saveFlowSession } from "@/actions/saveFlowSession";
import { FLOW_COOLDOWN_MS } from "@/constants/app";

interface UseFlowStateReturn {
  isFlow: boolean;
  toggle: () => boolean;
  activate: () => void;
  deactivate: () => void;
}

export function useFlowState(): UseFlowStateReturn {
  const [isFlow, setIsFlow] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const lastToggleRef = useRef<number>(0);

  const toggle = useCallback(() => {
    const now = Date.now();

    if (now - lastToggleRef.current < FLOW_COOLDOWN_MS) return false;
    lastToggleRef.current = now;

    setIsFlow((v) => {
      if (!v) {
        startTimeRef.current = now;
      } else {
        if (startTimeRef.current !== null) {
          const durationSeconds = Math.floor((now - startTimeRef.current) / 1000);
          saveFlowSession(durationSeconds);
          startTimeRef.current = null;
        }
      }
      return !v;
    });
    return true;
  }, []);

  const activate = useCallback(() => setIsFlow(true), []);
  const deactivate = useCallback(() => setIsFlow(false), []);

  return { isFlow, toggle, activate, deactivate };
}
