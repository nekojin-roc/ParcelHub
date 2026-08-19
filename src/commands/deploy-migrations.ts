import { spawnSync } from "node:child_process";
import { mkdir, open } from "node:fs/promises";
import path from "node:path";
import {
  parseArguments,
  prisma,
  runCommand,
  sqlitePathFromEnvironment,
} from "./cli.js";

const USAGE = "Usage: npm run db:migrate:deploy";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {});
  if (parsed.positionals.length > 0) throw new Error("No arguments are accepted");

  const database = sqlitePathFromEnvironment();
  await mkdir(path.dirname(database), { recursive: true });
  const handle = await open(database, "a");
  await handle.close();
  await prisma.$disconnect();

  const executable = path.resolve(
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma"
  );
  const result = spawnSync(executable, ["migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) throw new Error("Migration deployment failed");
}

runCommand(USAGE, main);
