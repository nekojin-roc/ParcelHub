import type { FastifyInstance } from "fastify";
import { z } from "zod";

const updateRecipientSchema = z.object({
  recipientId: z.string().min(1).nullable(),
});

const registeredUserInclude = {
  recipient: {
    select: { id: true, name: true, email: true },
  },
} as const;

export async function adminUserRoutes(app: FastifyInstance) {
  app.get("/api/admin/users", async () => {
    return app.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        ...registeredUserInclude,
      },
    });
  });

  app.patch<{ Params: { id: string } }>(
    "/api/admin/users/:id/recipient",
    async (request, reply) => {
      const parsed = updateRecipientSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const user = await app.prisma.user.findUnique({
        where: { id: request.params.id },
        select: { id: true },
      });
      if (!user) return reply.status(404).send({ error: "User not found" });

      const { recipientId } = parsed.data;
      if (recipientId) {
        const recipient = await app.prisma.recipient.findUnique({
          where: { id: recipientId },
          select: { id: true },
        });
        if (!recipient) {
          return reply.status(404).send({ error: "Recipient not found" });
        }

        const existingLink = await app.prisma.user.findFirst({
          where: {
            recipientId,
            id: { not: request.params.id },
          },
          select: { id: true },
        });
        if (existingLink) {
          return reply.status(409).send({
            error: "This recipient is already linked to another user",
          });
        }
      }

      try {
        return await app.prisma.user.update({
          where: { id: request.params.id },
          data: { recipientId },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            role: true,
            createdAt: true,
            ...registeredUserInclude,
          },
        });
      } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
          return reply.status(409).send({
            error: "This recipient is already linked to another user",
          });
        }
        throw error;
      }
    }
  );
}
