import {
  normalizeEmail,
  optionString,
  parseArguments,
  prisma,
  requiredOption,
  runCommand,
} from "./cli.js";

const action = process.argv[2];
const USAGE = `Usage:
  npm run user:disable -- --email <email> [--reason <text>]
  npm run user:enable -- --email <email>`;

async function main(): Promise<void> {
  if (action !== "disable" && action !== "enable") {
    throw new Error("Command action must be disable or enable");
  }
  const parsed = parseArguments(process.argv.slice(3), {
    email: "string",
    reason: "string",
  });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  if (action === "enable" && optionString(parsed, "reason")) {
    throw new Error("--reason is only valid when disabling an account");
  }

  const email = normalizeEmail(requiredOption(parsed, "email"));
  const reason = optionString(parsed, "reason")?.slice(0, 500) ?? null;

  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: { email },
      select: { id: true, role: true, disabledAt: true },
    });
    if (!user) throw new Error(`No account exists for ${email}`);

    if (action === "disable" && user.role === "ADMIN") {
      const activeAdministratorCount = await transaction.user.count({
        where: { role: "ADMIN", disabledAt: null },
      });
      if (!user.disabledAt && activeAdministratorCount <= 1) {
        throw new Error(
          "Refusing to disable the last active administrator. Promote or enable another administrator first."
        );
      }
    }

    if (action === "disable" && user.disabledAt) {
      return { outcome: "already-disabled" as const, revoked: 0 };
    }
    if (action === "enable" && !user.disabledAt) {
      return { outcome: "already-enabled" as const, revoked: 0 };
    }

    await transaction.user.update({
      where: { id: user.id },
      data:
        action === "disable"
          ? { disabledAt: new Date(), disabledReason: reason }
          : { disabledAt: null, disabledReason: null },
    });
    const revoked = await transaction.session.deleteMany({
      where: { userId: user.id },
    });
    return { outcome: action as "disable" | "enable", revoked: revoked.count };
  });

  if (result.outcome === "already-disabled") {
    console.log(`${email} is already disabled; no changes made.`);
  } else if (result.outcome === "already-enabled") {
    console.log(`${email} is already enabled; no changes made.`);
  } else {
    console.log(
      `${action === "disable" ? "Disabled" : "Enabled"} ${email} and revoked ${result.revoked} session(s).`
    );
  }
}

runCommand(USAGE, main);
