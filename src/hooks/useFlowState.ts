import { useState, useCallback, useRef } from "react";
import { saveFlowSession } from "@/actions/saveFlowSession";

const COOLDOWN_MS = 3000

interface UseFlowStateReturn {
  isFlow: boolean;
  toggle: () => void;
  activate: () => void;
  deactivate: () => void;
}

export function useFlowState(): UseFlowStateReturn {
  const [isFlow, setIsFlow] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const lastToggleRef = useRef<number>(0);

  const toggle = useCallback(() => {
    const now = Date.now();

    if (now - lastToggleRef.current < COOLDOWN_MS) return;
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
  }, []);

  const activate = useCallback(() => setIsFlow(true), []);
  const deactivate = useCallback(() => setIsFlow(false), []);

  return { isFlow, toggle, activate, deactivate };
}
