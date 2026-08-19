import {
  normalizeEmail,
  parseArguments,
  prisma,
  requiredOption,
  runCommand,
} from "./cli.js";

const USAGE = "Usage: npm run sessions:revoke -- --email <email>";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), { email: "string" });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const email = normalizeEmail(requiredOption(parsed, "email"));
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) throw new Error(`No account exists for ${email}`);

  const revoked = await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`Revoked ${revoked.count} session(s) for ${email}.`);
}

runCommand(USAGE, main);
