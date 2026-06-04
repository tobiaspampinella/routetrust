import { NextResponse } from "next/server";
import { createMapPointSchema } from "@/features/route-map/schemas";
import { readJsonBody, routeMapErrorResponse } from "@/features/route-map/server/api";
import { createMapPoint, listMapPoints } from "@/features/route-map/server/store";

export async function GET() {
  try {
    const points = await listMapPoints();
    return NextResponse.json({ points });
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createMapPointSchema.parse(await readJsonBody(request));
    const result = await createMapPoint(input);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return routeMapErrorResponse(error);
  }
}
