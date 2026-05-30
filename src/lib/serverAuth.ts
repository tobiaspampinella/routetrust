import { testUsersDb, toSessionUser } from "@/data/testUsersDb";
import { sha256Hex } from "@/lib/sessionToken";

export async function authenticateTestUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = testUsersDb.find((item) => item.email.toLowerCase() === normalizedEmail);
  if (!user) return null;

  const passwordHash = await sha256Hex(password);
  if (passwordHash !== user.passwordHash) return null;

  return toSessionUser(user);
}
