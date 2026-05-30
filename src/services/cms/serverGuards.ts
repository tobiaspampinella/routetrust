import type { NextRequest } from "next/server";
import type { CmsPermission, CmsRole } from "@/modules/cms/types";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/sessionToken";
import { canPerform } from "@/services/permissions/rbac";

export function mapSessionRoleToCmsRole(role: "admin" | "driver"): CmsRole {
  return role === "admin" ? "super_admin" : "driver";
}

export async function requireCmsPermission(request: NextRequest, permission: CmsPermission, tenantId = "tenant-demo-latam") {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      error: "No autenticado.",
    };
  }

  const cmsRole = mapSessionRoleToCmsRole(user.role);
  if (!canPerform(cmsRole, permission)) {
    return {
      ok: false as const,
      status: 403,
      error: "Permiso insuficiente.",
    };
  }

  const allowedTenantIds = user.role === "admin" ? ["tenant-demo-latam", "tenant-amba-fast"] : ["tenant-demo-latam"];
  if (!allowedTenantIds.includes(tenantId)) {
    return {
      ok: false as const,
      status: 403,
      error: "Acceso cross-tenant bloqueado.",
    };
  }

  return {
    ok: true as const,
    user,
    cmsRole,
    tenantId,
  };
}
