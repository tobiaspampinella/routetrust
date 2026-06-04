import { NextResponse } from "next/server";
import { updateRoutePlanSchema } from "@/features/route-map/schemas";
import { readJsonBody, routeMapErrorResponse } from "@/features/route-map/server/api";
import { deleteRoutePlan, findRoutePlan, updateRoutePlan } from "@/features/route-map/server/store";
import { RouteMapStoreError } from "@/features/route-map/server/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const route = await findRoutePlan(id);
    if (!route) throw new RouteMapStoreError("Route plan not found.", 404);
    return NextResponse.json({ route });
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const input = updateRoutePlanSchema.parse(await readJsonBody(request));
    const result = await updateRoutePlan(id, input);
    return NextResponse.json(result);
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteRoutePlan(id);
    return NextResponse.json(result);
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}
