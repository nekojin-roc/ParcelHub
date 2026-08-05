import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export type UserRole = "ADMIN" | "USER";

// The Vite development server proxies /api to Fastify, and production serves
// the client and API from the same origin.  Better Auth's default /api/auth
// base path therefore works in both environments.
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
          input: false,
        },
      },
    }),
  ],
});

export function getUserRole(role: unknown): UserRole {
  return role === "ADMIN" ? "ADMIN" : "USER";
}
