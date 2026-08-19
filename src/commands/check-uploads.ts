import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import {
  optionEnabled,
  parseArguments,
  prisma,
  requireConfirmation,
  runCommand,
} from "./cli.js";
import { packagePhotoDirectory } from "../services/package-photo.js";

const USAGE = `Usage:
  npm run uploads:check
  npm run uploads:check -- --delete-orphans --confirm DELETE-ORPHANS`;

async function directoryFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {
    "delete-orphans": "boolean",
    confirm: "string",
  });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const deleteOrphans = optionEnabled(parsed, "delete-orphans");
  if (deleteOrphans) requireConfirmation(parsed, "DELETE-ORPHANS");

  const records = await prisma.package.findMany({
    where: { photoPath: { not: null } },
    select: { id: true, barcode: true, photoPath: true },
  });
  const directory = packagePhotoDirectory();
  const files = await directoryFiles(directory);
  const fileSet = new Set(files);
  const referenced = new Set<string>();
  const unsafeReferences: Array<{ barcode: string; photoPath: string }> = [];
  const missing: Array<{ barcode: string; photoPath: string }> = [];

  for (const record of records) {
    const filename = record.photoPath!;
    if (path.basename(filename) !== filename) {
      unsafeReferences.push({ barcode: record.barcode, photoPath: filename });
      continue;
    }
    referenced.add(filename);
    if (!fileSet.has(filename)) {
      missing.push({ barcode: record.barcode, photoPath: filename });
    }
  }

  const orphans = files.filter((filename) => !referenced.has(filename));
  console.log(`Photo directory: ${directory}`);
  console.log(`Referenced photos: ${referenced.size}`);
  console.log(`Missing files: ${missing.length}`);
  console.log(`Orphan files: ${orphans.length}`);
  console.log(`Unsafe database paths: ${unsafeReferences.length}`);
  if (missing.length > 0) console.table(missing);
  if (unsafeReferences.length > 0) console.table(unsafeReferences);
  if (orphans.length > 0) console.log(orphans.join("\n"));

  if (deleteOrphans) {
    for (const filename of orphans) {
      const target = path.join(directory, filename);
      const metadata = await stat(target);
      if (metadata.isFile()) await unlink(target);
    }
    console.log(`Deleted ${orphans.length} orphan file(s).`);
  }

  if (missing.length > 0 || unsafeReferences.length > 0) {
    throw new Error("Upload consistency checks found database reference problems");
  }
}

runCommand(USAGE, main);
