import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";
import { recordAuditEvent } from "@/services/audit/runtimeAuditStore";

export async function GET(request: NextRequest) {
  const guard = await requireCmsPermission(request, "configure");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const missing = [
    ...(!process.env.TELEGRAM_BOT_TOKEN ? ["TELEGRAM_BOT_TOKEN"] : []),
    ...(!process.env.TELEGRAM_CHAT_ID ? ["TELEGRAM_CHAT_ID"] : []),
  ];

  const payload = {
    configured: missing.length === 0,
    missing,
    status: missing.length === 0 ? "configured" : "not_configured",
  };

  if (missing.length > 0) {
    await recordAuditEvent({
      action: "telegram_status_checked",
      actor: {
        id: guard.user.id,
        name: guard.user.name,
        role: guard.user.role,
      },
      module: "telegram",
      result: "warning",
      details: {
        missing,
      },
    });
  }

  return NextResponse.json(payload);
}
