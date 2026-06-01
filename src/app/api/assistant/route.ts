import { NextRequest, NextResponse } from "next/server";
import { createBugReport, routeBugReport } from "@/lib/bugReporting";
import { classifyAssistantRequest } from "@/lib/localAssistant";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/sessionToken";
import { recordBugDispatch, saveBugReport } from "@/services/bugs/bugStore";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await verifySessionToken(token);

  const body = (await request.json().catch(() => null)) as
    | {
        message?: string;
        pathname?: string;
        createTicket?: boolean;
      }
    | null;

  if (!body?.message?.trim()) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const decision = classifyAssistantRequest({
    message: body.message,
    pathname: body.pathname || "/",
    userRole: user?.role || null,
  });

  if (!body.createTicket || !decision.shouldCreateTicket || !user) {
    return NextResponse.json({
      reply: decision.quickResponse,
      decision,
      ticket: null,
      routing: null,
    });
  }

  const ticket = createBugReport({
    source: decision.source,
    module: decision.module,
    description: body.message,
    routePath: decision.pageContext.pathname,
    severity: decision.severity,
    title: decision.title,
    category: decision.category,
    intent: decision.intent,
    assignedAgents: decision.assignedAgents,
    reproductionSteps: decision.reproductionSteps,
    expectedResult: decision.expectedResult,
    actualResult: decision.actualResult,
    quickResponse: decision.quickResponse,
    pageContext: decision.pageContext,
    triageNotes: decision.triageNotes,
    confidence: decision.confidence,
    createdBy: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
  const routing = routeBugReport(ticket);

  await saveBugReport(ticket);
  await recordBugDispatch({
    bugId: ticket.id,
    routedAt: new Date().toISOString(),
    primaryAgent: routing.primaryAgent,
    collaboratingAgents: routing.collaboratingAgents,
    severity: ticket.severity,
    note: routing.nextStep,
  });

  return NextResponse.json({
    reply: decision.quickResponse,
    decision,
    ticket,
    routing,
  });
}
