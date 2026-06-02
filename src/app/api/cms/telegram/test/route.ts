import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";
import { recordAuditEvent } from "@/services/audit/runtimeAuditStore";

export async function POST(request: NextRequest) {
  const guard = await requireCmsPermission(request, "configure");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const missing = [...(!token ? ["TELEGRAM_BOT_TOKEN"] : []), ...(!chatId ? ["TELEGRAM_CHAT_ID"] : [])];

  if (missing.length > 0) {
    await recordAuditEvent({
      action: "telegram_test_blocked",
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
    return NextResponse.json({
      sent: false,
      status: "missing_configuration",
      missing,
      detail: "Telegram no configurado en este entorno.",
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }

  const text = encodeURIComponent(`RoutePulse AI CMS beta: test notification OK (${new Date().toISOString()})`);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`, {
    method: "POST",
  }).catch((error: Error) => error);

  if (response instanceof Error) {
    await recordAuditEvent({
      action: "telegram_test_failed",
      actor: {
        id: guard.user.id,
        name: guard.user.name,
        role: guard.user.role,
      },
      module: "telegram",
      result: "failure",
      details: {
        error: response.message,
      },
    });
    return NextResponse.json({
      sent: false,
      status: "failed",
      detail: response.message,
      timestamp: new Date().toISOString(),
    }, { status: 502 });
  }

  if (!response.ok) {
    await recordAuditEvent({
      action: "telegram_test_failed",
      actor: {
        id: guard.user.id,
        name: guard.user.name,
        role: guard.user.role,
      },
      module: "telegram",
      result: "failure",
      details: {
        httpStatus: response.status,
      },
    });
    return NextResponse.json({
      sent: false,
      status: "failed",
      detail: `Telegram respondio ${response.status}.`,
      timestamp: new Date().toISOString(),
    }, { status: 502 });
  }

  await recordAuditEvent({
    action: "telegram_test_sent",
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
    module: "telegram",
    result: "success",
    details: {
      chatId,
    },
  });

  return NextResponse.json({
    sent: true,
    status: "sent",
    detail: "Notificacion de prueba enviada.",
    timestamp: new Date().toISOString(),
  });
}
