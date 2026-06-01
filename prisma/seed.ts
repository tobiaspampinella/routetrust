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
      name: "Demo Company",
      slug: "demo",
    },
  });

  const existingRoutes = await prismaClient.route.findMany({
    where: { tenantId: tenant.id },
    select: { id: true },
  });
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

  const driver = await prismaClient.driver.create({
    data: {
      tenantId: tenant.id,
      name: "Carlos Mendez",
      phone: "+52 55 0101 2020",
      status: "available",
      currentLat: 19.4326,
      currentLng: -99.1332,
      lastSeenAt: new Date(),
    },
  });

  await prismaClient.route.create({
    data: {
      tenantId: tenant.id,
      driverId: driver.id,
      status: "draft",
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
      tenantId: tenant.id,
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
