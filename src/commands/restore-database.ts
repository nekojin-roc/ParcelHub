import { PrismaClient } from "@prisma/client";
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  rename,
  stat,
} from "node:fs/promises";
import path from "node:path";
import {
  parseArguments,
  requireConfirmation,
  requiredOption,
  runCommand,
  sqlitePathFromEnvironment,
} from "./cli.js";
import { checkDatabase, databaseIsHealthy } from "./database-health.js";
import { fileSha256, listFiles } from "./file-utils.js";

const USAGE =
  "Usage: npm run db:restore -- --from <backup-directory> --confirm RESTORE";

type BackupManifest = {
  formatVersion: number;
  database: { path: string; sha256: string };
  uploadsIncluded: boolean;
  uploads: Array<{ path: string; sha256: string }>;
};

async function exists(filename: string): Promise<boolean> {
  try {
    await stat(filename);
    return true;
  } catch {
    return false;
  }
}

function timestamp(): string {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function resolveManifestPath(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Backup manifest contains an unsafe path: ${relativePath}`);
  }
  return resolved;
}

async function validateDatabase(filename: string): Promise<void> {
  const client = new PrismaClient({
    datasources: { db: { url: `file:${filename}` } },
  });
  try {
    const health = await checkDatabase(client);
    if (!databaseIsHealthy(health)) {
      throw new Error("Backup database failed integrity or foreign-key checks");
    }
  } finally {
    await client.$disconnect();
  }
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {
    from: "string",
    confirm: "string",
  });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  requireConfirmation(parsed, "RESTORE");

  const source = path.resolve(requiredOption(parsed, "from"));
  const manifest = JSON.parse(
    await readFile(path.join(source, "manifest.json"), "utf8")
  ) as BackupManifest;
  if (manifest.formatVersion !== 1 || !manifest.database?.path) {
    throw new Error("Unsupported or invalid backup manifest");
  }
  const sourceDatabase = resolveManifestPath(source, manifest.database.path);
  if ((await fileSha256(sourceDatabase)) !== manifest.database.sha256) {
    throw new Error("Backup database checksum does not match its manifest");
  }
  await validateDatabase(sourceDatabase);

  const sourceUploads = path.join(source, "uploads");
  const manifestUploads = manifest.uploads ?? [];
  if (manifest.uploadsIncluded) {
    const actualFiles = await listFiles(sourceUploads);
    const actualPaths = actualFiles.map((filename) => path.relative(sourceUploads, filename));
    const expectedPaths = manifestUploads.map((upload) => upload.path).sort();
    if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
      throw new Error("Backup upload file list does not match its manifest");
    }
    for (const upload of manifestUploads) {
      const filename = resolveManifestPath(sourceUploads, upload.path);
      if ((await fileSha256(filename)) !== upload.sha256) {
        throw new Error(`Backup upload checksum mismatch: ${upload.path}`);
      }
    }
  } else if (manifestUploads.length > 0) {
    throw new Error("Backup manifest contains inconsistent upload metadata");
  }

  const targetDatabase = sqlitePathFromEnvironment();
  if (sourceDatabase === targetDatabase) {
    throw new Error("Backup and active database paths must be different");
  }
  await mkdir(path.dirname(targetDatabase), { recursive: true });

  const suffix = `.pre-restore-${timestamp()}`;
  const safetyDatabase = `${targetDatabase}${suffix}`;
  if (await exists(targetDatabase)) await copyFile(targetDatabase, safetyDatabase);
  for (const sidecarSuffix of ["-wal", "-shm"] as const) {
    const sidecar = `${targetDatabase}${sidecarSuffix}`;
    if (await exists(sidecar)) await rename(sidecar, `${sidecar}${suffix}`);
  }

  const stagedDatabase = `${targetDatabase}.restore-${process.pid}`;
  await copyFile(sourceDatabase, stagedDatabase);
  await rename(stagedDatabase, targetDatabase);

  const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "uploads");
  let safetyUploads: string | null = null;
  if (await exists(uploadRoot)) {
    safetyUploads = `${uploadRoot}${suffix}`;
    await rename(uploadRoot, safetyUploads);
  }
  if (manifest.uploadsIncluded) {
    await cp(sourceUploads, uploadRoot, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }

  await validateDatabase(targetDatabase);
  console.log(`Restored database from ${source}`);
  if (await exists(safetyDatabase)) {
    console.log(`Previous database retained at ${safetyDatabase}`);
  }
  if (safetyUploads) console.log(`Previous uploads retained at ${safetyUploads}`);
}

runCommand(USAGE, main);
