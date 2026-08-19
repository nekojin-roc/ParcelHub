import { parseArguments, prisma, runCommand } from "./cli.js";

const USAGE = "Usage: npm run admin:list";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {});
  if (parsed.positionals.length > 0) throw new Error("No arguments are accepted");

  const administrators = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      disabledAt: true,
      createdAt: true,
      _count: { select: { sessions: true } },
    },
  });

  if (administrators.length === 0) {
    console.log("No administrator accounts exist.");
    return;
  }

  console.table(
    administrators.map((administrator) => ({
      email: administrator.email,
      name: administrator.name,
      verified: administrator.emailVerified,
      disabled: Boolean(administrator.disabledAt),
      sessions: administrator._count.sessions,
      createdAt: administrator.createdAt.toISOString(),
      id: administrator.id,
    }))
  );
}

runCommand(USAGE, main);
