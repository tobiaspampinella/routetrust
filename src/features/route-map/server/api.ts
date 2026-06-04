import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { RouteMapStoreError } from "./store";

export async function readJsonBody(request: Request) {
  return request.json().catch(() => null);
}

export function routeMapErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request payload.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof RouteMapStoreError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Route map request failed." }, { status: 500 });
}
