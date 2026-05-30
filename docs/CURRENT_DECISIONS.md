# Current Decisions - RoutePulse AI Local Run

## 2026-05-30 - New PC Restore Decisions

- Restore from `RoutePulseAI_Portable_Cycle0_2026-05-27.zip` into `routepulse-ai-tester`.
- Use npm because no lockfile or `packageManager` field was restored.
- Use temporary npm CLI in `C:\Users\tobii\.codex\tmp\npm-cli` because npm is not installed on PATH.
- Prepend bundled Node path before npm commands because PATH `node.exe` is blocked by Windows.
- Do not upgrade Next.js during restore; record the security warning as a dedicated hardening task.
- Do not build new features until restore, install, audit, Git setup and minimum gates are documented.
- Treat current CMS/demo state as beta demo foundation, not complete production SaaS persistence.

Date: 2026-05-27
Status: Cycle 0 local-run schema active

## Current Goal

Get the project running locally with the minimum required setup. Do not build new features in this cycle.

## Current Stack Reality

- Next.js 15.1.3 App Router currently runs the web app.
- NestJS backend is not present yet.
- Prisma schema exists and validates with Prisma 6.
- PostgreSQL and Redis require Docker/Colima or local services.

## Local Run Decisions

- Use Prisma 6 because Prisma 7 rejects classic datasource URL schemas requested by Cycle 0.
- Use the simple Cycle 0 schema only.
- Keep `.env` and `.env.local` local and gitignored.
- Use `docker-compose.yml` exactly for Postgres 15 and Redis 7.

## Prisma Schema Content

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users     User[]
  routes    Route[]
  drivers   Driver[]
}

model User {
  id        String   @id @default(uuid())
  tenantId  String
  email     String   @unique
  password  String
  role      String   @default("VIEWER")
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
}

model Driver {
  id         String    @id @default(uuid())
  tenantId   String
  name       String
  phone      String?
  status     String    @default("available")
  currentLat Float?
  currentLng Float?
  lastSeenAt DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  tenant     Tenant    @relation(fields: [tenantId], references: [id])
  routes     Route[]

  @@index([tenantId])
}

model Route {
  id               String      @id @default(uuid())
  tenantId         String
  status           String      @default("draft")
  driverId         String?
  estimatedMinutes Int?
  slaDeadline      DateTime?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  tenant           Tenant      @relation(fields: [tenantId], references: [id])
  driver           Driver?     @relation(fields: [driverId], references: [id])
  stops            RouteStop[]

  @@index([tenantId])
  @@index([status])
}

model RouteStop {
  id          String    @id @default(uuid())
  routeId     String
  address     String
  lat         Float
  lng         Float
  sequence    Int
  status      String    @default("pending")
  arrivedAt   DateTime?
  completedAt DateTime?
  route       Route     @relation(fields: [routeId], references: [id])

  @@index([routeId])
}

model AuditLog {
  id           String   @id @default(uuid())
  tenantId     String
  actorId      String
  actorRole    String
  action       String
  module       String
  resourceId   String?
  resourceType String?
  timestamp    DateTime @default(now())

  @@index([tenantId])
  @@index([timestamp])
}
```
