import { z } from "zod";
import { MAP_POINT_STATUSES, MAP_POINT_TYPES, ROUTE_PLAN_STATUSES } from "./types";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : undefined));

export const pointIdSchema = z.string().trim().min(1).max(120);

export const routeCoordinateSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const createMapPointSchema = routeCoordinateSchema.extend({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(3).max(240),
  type: z.enum(MAP_POINT_TYPES).default("delivery"),
  status: z.enum(MAP_POINT_STATUSES).default("active"),
  contactName: optionalText,
  notes: optionalText,
});

export const updateMapPointSchema = createMapPointSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one point field is required.",
});

const routePlanBaseSchema = z.object({
  name: z.string().trim().min(2).max(140),
  status: z.enum(ROUTE_PLAN_STATUSES).default("planned"),
  originPointId: pointIdSchema,
  destinationPointId: pointIdSchema,
  stopPointIds: z.array(pointIdSchema).max(24).default([]),
  notes: optionalText,
});

export const createRoutePlanSchema = routePlanBaseSchema.refine((value) => value.originPointId !== value.destinationPointId, {
  message: "originPointId and destinationPointId must be different.",
  path: ["destinationPointId"],
});

export const updateRoutePlanSchema = routePlanBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one route field is required.",
  })
  .refine((value) => !value.originPointId || !value.destinationPointId || value.originPointId !== value.destinationPointId, {
    message: "originPointId and destinationPointId must be different.",
    path: ["destinationPointId"],
  });

export type CreateMapPointInput = z.infer<typeof createMapPointSchema>;
export type UpdateMapPointInput = z.infer<typeof updateMapPointSchema>;
export type CreateRoutePlanInput = z.infer<typeof createRoutePlanSchema>;
export type UpdateRoutePlanInput = z.infer<typeof updateRoutePlanSchema>;
