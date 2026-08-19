import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  connectedSqlitePath,
  optionString,
  parseArguments,
  prisma,
  runCommand,
} from "./cli.js";
import { digestFile, listFiles } from "./file-utils.js";

const USAGE = "Usage: npm run db:backup -- [--output <new-directory>]";

function timestamp(): string {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function exists(filename: string): Promise<boolean> {
  try {
    await stat(filename);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), { output: "string" });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const output = path.resolve(
    optionString(parsed, "output") ?? path.join("backups", `parcelhub-${timestamp()}`)
  );
  const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "uploads");
  if (output === uploadRoot || output.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error("Backup output cannot be inside UPLOAD_DIR");
  }
  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(output, { recursive: false });

  const sourceDatabase = await connectedSqlitePath();
  const backupDatabase = path.join(output, "parcelhub.db");
  const escapedDestination = backupDatabase.replaceAll("'", "''");
  await prisma.$executeRawUnsafe(`VACUUM INTO '${escapedDestination}'`);

  const backupUploads = path.join(output, "uploads");
  const uploadsIncluded = await exists(uploadRoot);
  if (uploadsIncluded) {
    await cp(uploadRoot, backupUploads, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }

  const databaseDigest = await digestFile(backupDatabase, output);
  const uploadDigests = uploadsIncluded
    ? await Promise.all(
        (await listFiles(backupUploads)).map((filename) =>
          digestFile(filename, backupUploads)
        )
      )
    : [];
  const manifest = {
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    database: databaseDigest,
    uploadsIncluded,
    uploads: uploadDigests,
  };
  await writeFile(
    path.join(output, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { flag: "wx" }
  );

  console.log(`Backup created at ${output}`);
  console.log(`Database source: ${sourceDatabase}`);
  console.log(`Upload files included: ${uploadDigests.length}`);
}

runCommand(USAGE, main);
