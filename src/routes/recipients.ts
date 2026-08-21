import { FastifyInstance } from "fastify";
import { z } from "zod";
import { removePackagePhoto } from "../services/package-photo.js";

const createRecipientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

const updateRecipientSchema = createRecipientSchema.partial();

export async function recipientRoutes(app: FastifyInstance) {
  // List all recipients
  app.get("/api/recipients", async () => {
    const recipients = await app.prisma.recipient.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { packages: true },
        },
      },
    });
    return recipients;
  });

  // Get single recipient with their packages
  app.get<{ Params: { id: string } }>(
    "/api/recipients/:id",
    async (request, reply) => {
      const recipient = await app.prisma.recipient.findUnique({
        where: { id: request.params.id },
        include: {
          packages: {
            orderBy: { receivedAt: "desc" },
            include: { bin: true },
          },
        },
      });
      if (!recipient) return reply.status(404).send({ error: "Not found" });
      return recipient;
    }
  );

  // Create recipient
  app.post("/api/recipients", async (request, reply) => {
    const parsed = createRecipientSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const recipient = await app.prisma.recipient.create({
      data: parsed.data,
    });
    return reply.status(201).send(recipient);
  });

  // Update recipient
  app.patch<{ Params: { id: string } }>(
    "/api/recipients/:id",
    async (request, reply) => {
      const parsed = updateRecipientSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const recipient = await app.prisma.recipient.update({
        where: { id: request.params.id },
        data: parsed.data,
      });
      return recipient;
    }
  );

  // Delete recipient only when every package has completed outbound processing.
  app.delete<{ Params: { id: string } }>(
    "/api/recipients/:id",
    async (request, reply) => {
      const result = await app.prisma.$transaction(async (prisma) => {
        const recipient = await prisma.recipient.findUnique({
          where: { id: request.params.id },
          select: { id: true },
        });

        if (!recipient) return { outcome: "not-found" as const };

        const waitingPackageCount = await prisma.package.count({
          where: {
            recipientId: request.params.id,
            status: { not: "PICKED_UP" },
          },
        });

        if (waitingPackageCount > 0) {
          return { outcome: "has-waiting-packages" as const };
        }

        const completedPackages = await prisma.package.findMany({
          where: {
            recipientId: request.params.id,
            status: "PICKED_UP",
          },
          select: { photoPath: true },
        });

        await prisma.package.deleteMany({
          where: {
            recipientId: request.params.id,
            status: "PICKED_UP",
          },
        });
        await prisma.recipient.delete({
          where: { id: request.params.id },
        });

        return {
          outcome: "deleted" as const,
          photoPaths: completedPackages.flatMap(({ photoPath }) =>
            photoPath ? [photoPath] : []
          ),
        };
      });

      if (result.outcome === "not-found") {
        return reply.status(404).send({ error: "Not found" });
      }

      if (result.outcome === "has-waiting-packages") {
        return reply.status(409).send({
          error: "Cannot delete recipient with existing packages",
        });
      }

      const photoCleanupResults = await Promise.allSettled(
        result.photoPaths.map(removePackagePhoto)
      );
      photoCleanupResults.forEach((cleanupResult) => {
        if (cleanupResult.status === "rejected") {
          app.log.warn(
            { error: cleanupResult.reason, recipientId: request.params.id },
            "Unable to remove a package photo after deleting its recipient"
          );
        }
      });

      return reply.status(204).send();
    }
  );
}
