import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import prismaPlugin from "./utils/prisma-plugin.js";
import { recipientRoutes } from "./routes/recipients.js";
import { packageRoutes } from "./routes/packages.js";
import { binRoutes } from "./routes/bins.js";
import { userRoutes } from "./routes/user.js";
import { auth, ensureAdminExists } from "./auth.js";
import { requireAuth } from "./utils/auth-guard.js";
import { fromNodeHeaders } from "better-auth/node";

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, {
  origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,
});
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
await app.register(prismaPlugin);
await ensureAdminExists();

// Better Auth exposes its email/password and session endpoints here.  The
// adapter expects Fetch API Request/Response objects, so bridge Fastify's
// request and reply objects to that interface.
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const body = request.body ? JSON.stringify(request.body) : undefined;
    const authRequest = new Request(url, {
      method: request.method,
      headers: fromNodeHeaders(request.headers),
      body,
    });
    const response = await auth.handler(authRequest);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body ? await response.text() : null);
  },
});

// ParcelHub is a shared household hub, but all of its operational data and
// uploaded files require an authenticated session.  Better Auth owns its own
// public endpoints and the health check remains available to infrastructure.
app.addHook("preHandler", async (request, reply) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/api/health" || pathname.startsWith("/api/auth/")) {
    return;
  }
  const isAuthenticated = await requireAuth(request, reply);
  if (!isAuthenticated) return;

  if (
    request.authUser.role !== "ADMIN" &&
    request.routeOptions.config.allowNormalUser !== true
  ) {
    return reply.status(403).send({ error: "Administrator access required" });
  }
});

// Routes
await app.register(recipientRoutes);
await app.register(packageRoutes);
await app.register(binRoutes);
await app.register(userRoutes);

// Health check
app.get("/api/health", async () => ({ status: "ok" }));

// Start
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
