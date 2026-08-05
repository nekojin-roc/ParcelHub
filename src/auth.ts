import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./utils/prisma.js";

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

export const USER_ROLES = ["ADMIN", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  trustedOrigins: [clientUrl],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["ADMIN", "USER"],
        required: false,
        defaultValue: "USER",
        input: false,
        returned: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const adminCount = await prisma.user.count({
            where: { role: "ADMIN" },
          });
          return {
            data: {
              ...user,
              role: adminCount === 0 ? "ADMIN" : "USER",
            },
          };
        },
      },
    },
  },
});

// When roles are introduced to an installation that already has accounts,
// retain access by promoting the oldest account if no admin exists yet.
export async function ensureAdminExists(): Promise<void> {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) return;

  const oldestUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (oldestUser) {
    await prisma.user.update({
      where: { id: oldestUser.id },
      data: { role: "ADMIN" },
    });
  }
}
