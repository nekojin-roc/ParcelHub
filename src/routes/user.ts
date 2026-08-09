import type { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/api/my/packages",
    { config: { allowNormalUser: true } },
    async (request) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.authUser.id },
        select: {
          recipient: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      const recipient = user?.recipient ?? null;

      if (!recipient) return { recipient: null, packages: [] };

      const packages = await app.prisma.package.findMany({
        where: { recipientId: recipient.id },
        orderBy: { receivedAt: "desc" },
        include: {
          recipient: { select: { id: true, name: true, email: true } },
          bin: { select: { id: true, label: true } },
        },
      });

      return { recipient, packages };
    }
  );
}
