import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const prismaClient = prisma as any;

async function main() {
  const tenant = await prismaClient.tenant.upsert({
    where: { slug: "demo" },
    update: {
      name: "Demo Company",
      status: "active",
    },
    create: {
      id: "tenant-demo-latam",
      name: "Demo Company",
      slug: "demo",
    },
  });

  const existingRoutes = await prismaClient.route.findMany({
    where: { tenantId: tenant.id },
    select: { id: true },
  });
  await prismaClient.cmsApprovalRequest.deleteMany({ where: { tenantId: tenant.id } });
  await prismaClient.cmsIncident.deleteMany({ where: { tenantId: tenant.id } });
  await prismaClient.routeStop.deleteMany({
    where: { routeId: { in: existingRoutes.map((route: { id: string }) => route.id) } },
  });
  await prismaClient.route.deleteMany({ where: { tenantId: tenant.id } });
  await prismaClient.driver.deleteMany({ where: { tenantId: tenant.id } });

  const adminPassword = await bcrypt.hash("Admin1234!", 10);
  const dispatcherPassword = await bcrypt.hash("Demo1234!", 10);

  await prismaClient.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      tenantId: tenant.id,
      name: "Admin Demo",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      status: "active",
    },
    create: {
      tenantId: tenant.id,
      email: "admin@demo.com",
      name: "Admin Demo",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      status: "active",
    },
  });

  await prismaClient.user.upsert({
    where: { email: "dispatcher@demo.com" },
    update: {
      tenantId: tenant.id,
      name: "Dispatcher Demo",
      passwordHash: dispatcherPassword,
      role: "DISPATCHER",
      status: "active",
    },
    create: {
      tenantId: tenant.id,
      email: "dispatcher@demo.com",
      name: "Dispatcher Demo",
      passwordHash: dispatcherPassword,
      role: "DISPATCHER",
      status: "active",
    },
  });

  await prismaClient.driver.createMany({
    data: [
      {
        id: "driver-001",
        tenantId: tenant.id,
        name: "Miguel Alvarez",
        phone: "+52 55 0101 2020",
        status: "on_route",
        currentLat: 19.4326,
        currentLng: -99.1332,
        lastSeenAt: new Date(),
      },
      {
        id: "driver-002",
        tenantId: tenant.id,
        name: "Laura Jimenez",
        phone: "+52 55 0101 3030",
        status: "on_route",
        currentLat: 19.4157,
        currentLng: -99.1645,
        lastSeenAt: new Date(),
      },
      {
        id: "driver-003",
        tenantId: tenant.id,
        name: "Carlos Gomez",
        phone: "+52 55 0101 4040",
        status: "available",
        currentLat: 19.4271,
        currentLng: -99.1712,
        lastSeenAt: new Date(),
      },
    ],
  });

  await prismaClient.route.create({
    data: {
      id: "route-001",
      tenantId: tenant.id,
      driverId: "driver-001",
      status: "in_progress",
      estimatedMinutes: 45,
      slaDeadline: new Date(Date.now() + 60 * 60 * 1000),
      stops: {
        create: [
          {
            address: "Av. Paseo de la Reforma 222, Juarez, CDMX",
            lat: 19.4285,
            lng: -99.1686,
            sequence: 1,
            status: "pending",
          },
          {
            address: "Calle Rio Lerma 167, Cuauhtemoc, CDMX",
            lat: 19.4271,
            lng: -99.1712,
            sequence: 2,
            status: "pending",
          },
          {
            address: "Londres 247, Juarez, CDMX",
            lat: 19.4243,
            lng: -99.1658,
            sequence: 3,
            status: "pending",
          },
        ],
      },
    },
  });

  await prismaClient.route.create({
    data: {
      id: "route-002",
      tenantId: tenant.id,
      driverId: "driver-002",
      status: "suggested",
      estimatedMinutes: 35,
      slaDeadline: new Date(Date.now() + 90 * 60 * 1000),
      stops: {
        create: [
          {
            address: "Medellin 188, Roma Norte, CDMX",
            lat: 19.4157,
            lng: -99.1645,
            sequence: 1,
            status: "pending",
          },
          {
            address: "Orizaba 95, Roma Norte, CDMX",
            lat: 19.4172,
            lng: -99.1601,
            sequence: 2,
            status: "pending",
          },
          {
            address: "Campeche 284, Hipodromo, CDMX",
            lat: 19.4109,
            lng: -99.1687,
            sequence: 3,
            status: "pending",
          },
        ],
      },
    },
  });

  await prismaClient.cmsIncident.createMany({
    data: [
      {
        id: "incident-001",
        tenantId: tenant.id,
        title: "Customer absent at priority stop",
        status: "open",
        severity: "medium",
        ownerRole: "customer_experience",
        routeId: "route-002",
        createdAt: new Date("2026-05-27T10:10:00.000Z"),
        detail: "Requires proactive contact and possible second visit.",
      },
      {
        id: "incident-002",
        tenantId: tenant.id,
        title: "Extended pause caused by road incident",
        status: "in_review",
        severity: "high",
        ownerRole: "operations",
        routeId: "route-002",
        createdAt: new Date("2026-05-27T10:24:00.000Z"),
        detail: "Impacts ETA for seven pending deliveries.",
      },
    ],
  });

  await prismaClient.cmsApprovalRequest.create({
    data: {
      id: "approval-001",
      tenantId: tenant.id,
      action: "approve_suggested_routes",
      targetId: "route-002",
      title: "Approve west route with SLA risk",
      detail: "Estimated close 18:28. Human approval required because projected SLA is 88%.",
      requestedBy: "RoutePulse AI rules engine",
      requestedAt: new Date("2026-05-27T09:28:00.000Z"),
      status: "pending",
    },
  });

  await prismaClient.bugReport.upsert({
    where: { id: "bug-seed-demo-001" },
    update: {
      tenantId: tenant.id,
      title: "[BUG] qa: Demo smoke persistence baseline",
      description: "Seeded bug report to validate durable admin bug queue persistence.",
      status: "triaged",
      assignedAgents: ["bug-triage-agent", "fullstack-bug-fix-agent"],
      tags: ["bug", "qa", "seed"],
    },
    create: {
      id: "bug-seed-demo-001",
      tenantId: tenant.id,
      source: "qa",
      module: "qa",
      title: "[BUG] qa: Demo smoke persistence baseline",
      description: "Seeded bug report to validate durable admin bug queue persistence.",
      severity: "P3",
      status: "triaged",
      category: "bug",
      intent: "bug_report",
      assignedAgents: ["bug-triage-agent", "fullstack-bug-fix-agent"],
      reproductionSteps: ["Open admin bug reports.", "Validate seeded persistent ticket."],
      tags: ["bug", "qa", "seed"],
      createdByName: "Prisma Seed",
      createdByRole: "system",
    },
  });

  console.log("Seed data loaded for Demo Company.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
