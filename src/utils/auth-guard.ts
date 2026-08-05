import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

export type UserRole = "ADMIN" | "USER";

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
};

declare module "fastify" {
  interface FastifyRequest {
    authUser: AuthenticatedUser;
  }
  interface FastifyContextConfig {
    allowNormalUser?: boolean;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    await reply.status(401).send({ error: "Authentication required" });
    return false;
  }

  request.authUser = {
    ...session.user,
    role: session.user.role === "ADMIN" ? "ADMIN" : "USER",
  };
  return true;
}
