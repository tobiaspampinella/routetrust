import { cmsPermissions, type CmsPermission, type CmsRole, type RbacRule } from "@/modules/cms/types";

const fullAccess = Object.fromEntries(cmsPermissions.map((permission) => [permission, true])) as Record<CmsPermission, boolean>;

function allow(...allowed: CmsPermission[]) {
  return Object.fromEntries(cmsPermissions.map((permission) => [permission, allowed.includes(permission)])) as Record<CmsPermission, boolean>;
}

export const defaultRbacMatrix: RbacRule[] = [
  { role: "super_admin", permissions: fullAccess },
  { role: "company_admin", permissions: allow("view", "create", "update", "approve", "assign", "export", "configure") },
  { role: "operations", permissions: allow("view", "update", "approve", "assign", "export") },
  { role: "dispatcher", permissions: allow("view", "update", "assign") },
  { role: "driver", permissions: allow("view", "update") },
  { role: "customer_experience", permissions: allow("view", "update", "export") },
  { role: "customer_success", permissions: allow("view", "update", "export", "configure") },
  { role: "finance", permissions: allow("view", "export") },
  { role: "commercial", permissions: allow("view", "create", "update", "export") },
  { role: "external_customer", permissions: allow("view") },
  { role: "viewer", permissions: allow("view") },
];

export function getRolePermissions(role: CmsRole, matrix: RbacRule[] = defaultRbacMatrix) {
  return matrix.find((rule) => rule.role === role)?.permissions ?? allow("view");
}

export function canPerform(role: CmsRole, permission: CmsPermission, matrix: RbacRule[] = defaultRbacMatrix) {
  return Boolean(getRolePermissions(role, matrix)[permission]);
}

export function setRolePermission(matrix: RbacRule[], role: CmsRole, permission: CmsPermission, enabled: boolean) {
  return matrix.map((rule) =>
    rule.role === role
      ? {
          ...rule,
          permissions: {
            ...rule.permissions,
            [permission]: enabled,
          },
        }
      : rule,
  );
}
