import { checkDatabase, databaseIsHealthy } from "./database-health.js";
import {
  optionEnabled,
  parseArguments,
  prisma,
  runCommand,
} from "./cli.js";

const USAGE = "Usage: npm run db:check -- [--quick]";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), { quick: "boolean" });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const quick = optionEnabled(parsed, "quick");
  const health = await checkDatabase(prisma, quick);

  console.log(`${quick ? "Quick" : "Full"} integrity check: ${health.integrity.join(", ")}`);
  console.log(`Foreign-key violations: ${health.foreignKeyViolations.length}`);
  if (health.foreignKeyViolations.length > 0) {
    console.table(health.foreignKeyViolations);
  }
  if (!databaseIsHealthy(health)) throw new Error("Database checks failed");
}

runCommand(USAGE, main);
