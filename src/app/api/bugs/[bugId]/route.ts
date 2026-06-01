import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";
import { findBugReport, updateBugReportStatus } from "@/services/bugs/bugStore";
import type { BugStatus } from "@/lib/bugReporting";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ bugId: string }> }) {
  const guard = await requireCmsPermission(request, "update");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => null)) as { status?: BugStatus; assignedAgents?: string[] } | null;
  if (!body?.status) {
    return NextResponse.json({ error: "status is required." }, { status: 400 });
  }

  const { bugId } = await params;
  const report = await updateBugReportStatus(bugId, body.status, body.assignedAgents);
  if (!report) {
    return NextResponse.json({ error: "Bug report not found." }, { status: 404 });
  }

  return NextResponse.json({ report });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ bugId: string }> }) {
  const guard = await requireCmsPermission(request, "view");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { bugId } = await params;
  const report = await findBugReport(bugId);
  if (!report) {
    return NextResponse.json({ error: "Bug report not found." }, { status: 404 });
  }

  return NextResponse.json({ report });
}
