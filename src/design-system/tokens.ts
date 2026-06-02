import { routeTrustColors } from "./colors";
import { routeTrustSpacing } from "./spacing";
import { routeTrustTypography } from "./typography";

export const routeTrustTokens = {
  colors: routeTrustColors,
  spacing: routeTrustSpacing,
  typography: routeTrustTypography,
  radius: {
    card: "24px",
    pill: "999px",
    panel: "32px",
  },
  states: [
    "success",
    "warning",
    "incident",
    "delayed",
    "in progress",
    "completed",
    "blocked",
    "not configured",
    "demo only",
  ] as const,
} as const;
