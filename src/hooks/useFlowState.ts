import { useState, useCallback } from "react";

interface UseFlowStateReturn {
  isFlow: boolean;
  toggle: () => void;
  activate: () => void;
  deactivate: () => void;
}

export function useFlowState(): UseFlowStateReturn {
  const [isFlow, setIsFlow] = useState(false);

  const toggle = useCallback(() => setIsFlow((v) => !v), []);
  const activate = useCallback(() => setIsFlow(true), []);
  const deactivate = useCallback(() => setIsFlow(false), []);

  return { isFlow, toggle, activate, deactivate };
}
