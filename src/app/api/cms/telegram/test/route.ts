import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function POST(request: NextRequest) {
  const guard = await requireCmsPermission(request, "configure");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({
      ok: false,
      status: "skipped",
      detail: "TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no estan configurados.",
      timestamp: new Date().toISOString(),
    });
  }

  const text = encodeURIComponent(`RoutePulse AI CMS beta: test notification OK (${new Date().toISOString()})`);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`, {
    method: "POST",
  }).catch((error: Error) => error);

  if (response instanceof Error) {
    return NextResponse.json({
      ok: false,
      status: "failed",
      detail: response.message,
      timestamp: new Date().toISOString(),
    }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({
      ok: false,
      status: "failed",
      detail: `Telegram respondio ${response.status}.`,
      timestamp: new Date().toISOString(),
    }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    status: "sent",
    detail: "Notificacion de prueba enviada.",
    timestamp: new Date().toISOString(),
  });
}
