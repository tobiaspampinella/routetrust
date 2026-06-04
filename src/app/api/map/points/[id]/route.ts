import { NextResponse } from "next/server";
import { updateMapPointSchema } from "@/features/route-map/schemas";
import { readJsonBody, routeMapErrorResponse } from "@/features/route-map/server/api";
import { deleteMapPoint, findMapPoint, RouteMapStoreError, updateMapPoint } from "@/features/route-map/server/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const point = await findMapPoint(id);
    if (!point) throw new RouteMapStoreError("Map point not found.", 404);
    return NextResponse.json({ point });
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const input = updateMapPointSchema.parse(await readJsonBody(request));
    const result = await updateMapPoint(id, input);
    return NextResponse.json(result);
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteMapPoint(id);
    return NextResponse.json(result);
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}
