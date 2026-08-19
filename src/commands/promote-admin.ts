import {
  normalizeEmail,
  parseArguments,
  prisma,
  runCommand,
} from "./cli.js";

const USAGE = `Usage:
  npm run admin:promote -- <email> [--allow-unverified]

Promotes an existing ParcelHub account to ADMIN. The account must have a
verified email unless --allow-unverified is supplied for host-side recovery.`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }
  const parsed = parseArguments(args, { "allow-unverified": "boolean" });
  if (parsed.positionals.length !== 1) {
    throw new Error("Provide exactly one account email address");
  }
  const email = normalizeEmail(parsed.positionals[0]);
  const allowUnverified = parsed.options["allow-unverified"] === true;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      disabledAt: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error(
      `No account exists for ${email}. The user must sign up before promotion.`
    );
  }
  if (user.role === "ADMIN") {
    console.log(`${user.email} is already an administrator; no changes made.`);
    return;
  }
  if (!user.emailVerified && !allowUnverified) {
    throw new Error(
      `${user.email} is not verified. Verify it first or explicitly pass --allow-unverified for recovery.`
    );
  }
  if (user.disabledAt) {
    throw new Error(`${user.email} is disabled. Enable it before promotion.`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`Promoted ${user.email} to ADMIN.`);
}

runCommand(USAGE, main);
