import {
  normalizeEmail,
  parseArguments,
  prisma,
  runCommand,
} from "./cli.js";

const USAGE = "Usage: npm run admin:demote -- <email>";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {});
  if (parsed.positionals.length !== 1) {
    throw new Error("Provide exactly one administrator email address");
  }
  const email = normalizeEmail(parsed.positionals[0]);

  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new Error(`No account exists for ${email}`);
    if (user.role !== "ADMIN") return { outcome: "not-admin" as const };

    const otherActiveAdministratorCount = await transaction.user.count({
      where: {
        role: "ADMIN",
        disabledAt: null,
        id: { not: user.id },
      },
    });
    if (otherActiveAdministratorCount === 0) {
      throw new Error(
        "Refusing to demote the last active administrator. Promote or enable another administrator first."
      );
    }

    await transaction.user.update({
      where: { id: user.id },
      data: { role: "USER" },
    });
    const revoked = await transaction.session.deleteMany({
      where: { userId: user.id },
    });
    return { outcome: "demoted" as const, revoked: revoked.count };
  });

  if (result.outcome === "not-admin") {
    console.log(`${email} is not an administrator; no changes made.`);
    return;
  }
  console.log(`Demoted ${email} to USER and revoked ${result.revoked} session(s).`);
}

runCommand(USAGE, main);
