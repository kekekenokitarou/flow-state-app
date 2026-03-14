/**
 * Flow state UI copy and accessibility labels.
 * Centralizes strings for consistency and i18n readiness.
 */
export const FLOW_LABELS = {
  idle: "Ignite",
  flow: "Flow State",
} as const;

export const FLOW_STATUS = {
  idle: "Ready to focus",
  flow: "In Flow",
} as const;

export const FLOW_ARIA = {
  start: "フロー状態を開始",
  end: "フロー状態を終了",
} as const;
