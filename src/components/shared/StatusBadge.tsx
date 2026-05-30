import { Badge } from "@/components/ui/badge";
import type { PackageStatus, RiskLevel, RouteStatus } from "@/lib/types";
import { packageStatusLabels, riskLabels, routeStatusLabels } from "@/components/shared/status-labels";

type StatusBadgeProps =
  | {
      type: "package";
      status: PackageStatus;
    }
  | {
      type: "route";
      status: RouteStatus;
    }
  | {
      type: "risk";
      status: RiskLevel;
    };

export function StatusBadge(props: StatusBadgeProps) {
  if (props.type === "package") {
    return <Badge variant={props.status}>{packageStatusLabels[props.status]}</Badge>;
  }

  if (props.type === "route") {
    const variant =
      props.status === "paused" ? "paused" : props.status === "in_progress" ? "in_progress" : props.status === "completed" ? "delivered" : "pending";
    return <Badge variant={variant}>{routeStatusLabels[props.status]}</Badge>;
  }

  return <Badge variant={props.status}>{riskLabels[props.status]}</Badge>;
}
