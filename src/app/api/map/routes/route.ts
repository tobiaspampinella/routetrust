import { NextResponse } from "next/server";
import { createRoutePlanSchema } from "@/features/route-map/schemas";
import { readJsonBody, routeMapErrorResponse } from "@/features/route-map/server/api";
import { createRoutePlan, listRoutePlans } from "@/features/route-map/server/store";

export async function GET() {
  try {
    const routes = await listRoutePlans();
    return NextResponse.json({ routes });
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createRoutePlanSchema.parse(await readJsonBody(request));
    const result = await createRoutePlan(input);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}
