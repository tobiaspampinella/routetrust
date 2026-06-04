import "server-only";

const DEFAULT_TENANT_SLUG = process.env.ROUTETRUST_DEFAULT_TENANT_SLUG || "demo";
const DEFAULT_TENANT_ID = "tenant-demo-latam";

export async function resolveCmsTenant(prisma: any, tenantId?: string) {
  if (tenantId) {
    const explicitTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (explicitTenant) return explicitTenant;
  }

  const tenantBySlug = await prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } });
  if (tenantBySlug) return tenantBySlug;

  return prisma.tenant.create({
    data: {
      id: tenantId || DEFAULT_TENANT_ID,
      name: "Demo Company",
      slug: DEFAULT_TENANT_SLUG,
      status: "active",
    },
  });
}

export function ensureCmsFileFallbackAllowed(moduleName: string, databaseDetail: string) {
  const explicitDemoMode = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (process.env.NODE_ENV === "production" && !explicitDemoMode) {
    throw new Error(`${moduleName} file fallback is disabled outside demo mode. Database status: ${databaseDetail}`);
  }
}
