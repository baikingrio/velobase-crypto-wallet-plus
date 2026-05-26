export * from "./auth";
export * from "./billing";
export * from "./navigation";
export * from "./wallet";

import { AUTH_EVENTS } from "./auth";
import { BILLING_EVENTS } from "./billing";
import { NAVIGATION_EVENTS } from "./navigation";
import { WALLET_EVENTS } from "./wallet";

export const EVENTS = {
  ...AUTH_EVENTS,
  ...BILLING_EVENTS,
  ...NAVIGATION_EVENTS,
  ...WALLET_EVENTS,
} as const;
