import { NextRequest, NextResponse } from "next/server";
import { betaCoreModules, buildProjectIntelligenceReport, renderProjectIntelligenceMessage } from "@/lib/projectIntelligence";
import { APP_VERSION } from "@/lib/version";
import { requireCmsPermission } from "@/services/cms/serverGuards";

function currentReport() {
  return buildProjectIntelligenceReport({
    appVersion: APP_VERSION,
    buildStatus: "ready",
    modules: betaCoreModules,
    risks: [
      "No production database yet; beta uses local state.",
      "No critical Playwright suite yet.",
    ],
  });
}

export async function GET(request: NextRequest) {
  const guard = await requireCmsPermission(request, "view");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const report = currentReport();

  return NextResponse.json({
    report,
    message: renderProjectIntelligenceMessage(report),
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  });
}

export async function POST(request: NextRequest) {
  const guard = await requireCmsPermission(request, "configure");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const report = currentReport();
  const message = renderProjectIntelligenceMessage(report);

  if (!token || !chatId) {
    return NextResponse.json({
      ok: false,
      status: "skipped",
      report,
      detail: "TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no estan configurados.",
    });
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  }).catch((error: Error) => error);

  if (response instanceof Error) {
    return NextResponse.json({
      ok: false,
      status: "failed",
      detail: response.message,
      report,
    }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({
      ok: false,
      status: "failed",
      detail: `Telegram respondio ${response.status}.`,
      report,
    }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    status: "sent",
    report,
  });
}
