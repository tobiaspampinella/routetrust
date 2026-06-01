import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function GET(request: NextRequest) {
  const guard = await requireCmsPermission(request, "configure");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const missing = [
    ...(!process.env.TELEGRAM_BOT_TOKEN ? ["TELEGRAM_BOT_TOKEN"] : []),
    ...(!process.env.TELEGRAM_CHAT_ID ? ["TELEGRAM_CHAT_ID"] : []),
  ];

  return NextResponse.json({
    configured: missing.length === 0,
    missing,
    status: missing.length === 0 ? "configured" : "not_configured",
  });
}
