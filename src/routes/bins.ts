import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  DEFAULT_BIN_LABEL,
  ensureDefaultBin,
} from "../utils/default-bin.js";

const binSchema = z.object({
  label: z.string().trim().min(1),
  description: z.string().optional(),
  capacity: z.number().int().positive().default(10),
});

function isReservedLabel(label: string | undefined): boolean {
  return label?.trim().toLowerCase() === DEFAULT_BIN_LABEL.toLowerCase();
}

export async function binRoutes(app: FastifyInstance) {
  // List all bins with current occupancy
  app.get("/api/bins", async () => {
    const bins = await app.prisma.bin.findMany({
      orderBy: [{ isDefault: "desc" }, { label: "asc" }],
      include: {
        _count: {
          select: { packages: { where: { status: { not: "PICKED_UP" } } } },
        },
      },
    });
    return bins.map((bin) => ({
      ...bin,
      currentCount: bin._count.packages,
    }));
  });

  // Create bin
  app.post("/api/bins", async (request, reply) => {
    const parsed = binSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    if (isReservedLabel(parsed.data.label)) {
      return reply.status(409).send({
        error: `${DEFAULT_BIN_LABEL} is reserved for the default storage bin`,
      });
    }
    const bin = await app.prisma.bin.create({ data: parsed.data });
    return reply.status(201).send(bin);
  });

  // Update bin
  app.patch<{ Params: { id: string } }>(
    "/api/bins/:id",
    async (request, reply) => {
      const parsed = binSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const existing = await app.prisma.bin.findUnique({
        where: { id: request.params.id },
      });
      if (!existing) {
        return reply.status(404).send({ error: "Storage bin not found" });
      }
      if (existing.isDefault) {
        return reply.status(409).send({
          error: `The default ${DEFAULT_BIN_LABEL} bin cannot be modified`,
        });
      }
      if (isReservedLabel(parsed.data.label)) {
        return reply.status(409).send({
          error: `${DEFAULT_BIN_LABEL} is reserved for the default storage bin`,
        });
      }
      const bin = await app.prisma.bin.update({
        where: { id: request.params.id },
        data: parsed.data,
      });
      return bin;
    }
  );

  // Delete bin (only if empty)
  app.delete<{ Params: { id: string } }>(
    "/api/bins/:id",
    async (request, reply) => {
      const bin = await app.prisma.bin.findUnique({
        where: { id: request.params.id },
      });
      if (!bin) {
        return reply.status(404).send({ error: "Storage bin not found" });
      }
      if (bin.isDefault) {
        return reply.status(409).send({
          error: `The default ${DEFAULT_BIN_LABEL} bin cannot be deleted`,
        });
      }

      const count = await app.prisma.package.count({
        where: { binId: request.params.id, status: { not: "PICKED_UP" } },
      });
      if (count > 0) {
        return reply
          .status(409)
          .send({ error: "Cannot delete bin that contains active packages" });
      }

      const defaultBin = await ensureDefaultBin(app.prisma);
      await app.prisma.$transaction([
        app.prisma.package.updateMany({
          where: { binId: request.params.id },
          data: { binId: defaultBin.id },
        }),
        app.prisma.bin.delete({ where: { id: request.params.id } }),
      ]);
      return reply.status(204).send();
    }
  );
}
