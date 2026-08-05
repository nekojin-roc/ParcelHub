import type { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { prisma } from "./prisma.js";

// Extend Fastify types so app.prisma is recognized
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

async function prismaPlugin(app: FastifyInstance) {
  await prisma.$connect();

  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
}

export default fp(prismaPlugin);
