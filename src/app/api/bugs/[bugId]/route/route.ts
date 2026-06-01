import { NextRequest, NextResponse } from "next/server";
import { findBugReport, recordBugDispatch, updateBugReportStatus } from "@/services/bugs/bugStore";
import { routeBugReport } from "@/lib/bugReporting";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function POST(request: NextRequest, { params }: { params: Promise<{ bugId: string }> }) {
  const guard = await requireCmsPermission(request, "assign");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { bugId } = await params;
  const report = await findBugReport(bugId);
  if (!report) {
    return NextResponse.json({ error: "Bug report not found." }, { status: 404 });
  }

  const routing = routeBugReport(report);
  const updated = await updateBugReportStatus(bugId, "assigned", [routing.primaryAgent, ...routing.collaboratingAgents]);
  if (!updated) {
    return NextResponse.json({ error: "Bug report could not be routed." }, { status: 500 });
  }

  await recordBugDispatch({
    bugId,
    routedAt: new Date().toISOString(),
    primaryAgent: routing.primaryAgent,
    collaboratingAgents: routing.collaboratingAgents,
    severity: report.severity,
    note: routing.nextStep,
  });

  return NextResponse.json({ report: updated, routing });
}
