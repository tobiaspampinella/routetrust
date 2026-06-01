import { NextRequest, NextResponse } from "next/server";
import { createBugReport, routeBugReport, type BugCategory, type BugSeverity, type BugSource } from "@/lib/bugReporting";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/sessionToken";
import { requireCmsPermission } from "@/services/cms/serverGuards";
import { recordBugDispatch, saveBugReport, listBugReports } from "@/services/bugs/bugStore";

export async function GET(request: NextRequest) {
  const guard = await requireCmsPermission(request, "view");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const reports = await listBugReports();
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        source?: BugSource;
        module?: string;
        description?: string;
        routePath?: string;
        severity?: BugSeverity;
        title?: string;
        category?: BugCategory;
        intent?: "bug_report" | "ux_review" | "qa_validation" | "security_review" | "operational_status" | "support_request";
        assignedAgents?: string[];
        reproductionSteps?: string[];
        expectedResult?: string;
        actualResult?: string;
        quickResponse?: string;
        triageNotes?: string[];
        confidence?: number;
        pageContext?: {
          pathname: string;
          pageKey: string;
          pageLabel: string;
          module: string;
          source: BugSource;
          summary: string;
        };
      }
    | null;

  if (!body?.description?.trim()) {
    return NextResponse.json({ error: "description is required." }, { status: 400 });
  }

  const report = createBugReport({
    source: body.source ?? (user.role === "driver" ? "driver" : "admin"),
    module: body.module ?? body.pageContext?.module ?? "general",
    description: body.description,
    routePath: body.routePath,
    severity: body.severity,
    title: body.title,
    category: body.category,
    intent: body.intent,
    assignedAgents: body.assignedAgents,
    reproductionSteps: body.reproductionSteps,
    expectedResult: body.expectedResult,
    actualResult: body.actualResult,
    quickResponse: body.quickResponse,
    triageNotes: body.triageNotes,
    confidence: body.confidence,
    pageContext: body.pageContext,
    createdBy: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
  const routing = routeBugReport(report);

  await saveBugReport(report);
  await recordBugDispatch({
    bugId: report.id,
    routedAt: new Date().toISOString(),
    primaryAgent: routing.primaryAgent,
    collaboratingAgents: routing.collaboratingAgents,
    severity: report.severity,
    note: routing.nextStep,
  });

  return NextResponse.json({ report, routing }, { status: 201 });
}
