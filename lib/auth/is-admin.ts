import type { UserRead } from "@/lib/api/types";

export function isAdminUser(user: UserRead | null | undefined): boolean {
  return user?.role === "admin";
}
