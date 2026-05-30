import type { SessionUser } from "@/lib/types";

export interface TestUserRecord extends SessionUser {
  passwordHash: string;
}

export const testUsersDb: TestUserRecord[] = [
  {
    id: "user-admin-001",
    email: "admin@demo.com",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    role: "admin",
    name: "Admin Demo",
  },
  {
    id: "user-driver-001",
    email: "driver1@demo.com",
    passwordHash: "494d022492052a06f8f81949639a1d148c1051fa3d4e4688fbd96efe649cd382",
    role: "driver",
    name: "Miguel Alvarez",
    driverId: "driver-001",
    assignedRouteId: "route-001",
  },
  {
    id: "user-driver-002",
    email: "driver2@demo.com",
    passwordHash: "494d022492052a06f8f81949639a1d148c1051fa3d4e4688fbd96efe649cd382",
    role: "driver",
    name: "Laura Jimenez",
    driverId: "driver-002",
    assignedRouteId: "route-002",
  },
  {
    id: "user-driver-003",
    email: "driver3@demo.com",
    passwordHash: "494d022492052a06f8f81949639a1d148c1051fa3d4e4688fbd96efe649cd382",
    role: "driver",
    name: "Carlos Gomez",
    driverId: "driver-003",
    assignedRouteId: "route-003",
  },
];

export function toSessionUser(record: TestUserRecord): SessionUser {
  return {
    id: record.id,
    email: record.email,
    role: record.role,
    name: record.name,
    driverId: record.driverId,
    assignedRouteId: record.assignedRouteId,
  };
}
