import { spawnSync } from "node:child_process";
import path from "node:path";
import { parseArguments, prisma, runCommand } from "./cli.js";
import { ensureDefaultBin } from "../utils/default-bin.js";

const BASELINE = "20260819000000_baseline";
const ACCOUNT_CONTROLS = "20260819001000_account_controls";
const DEFAULT_BIN = "20260819002000_default_bin";
const USAGE = "Usage: npm run db:migrate:baseline";

function applyResolution(migration: string): void {
  const executable = path.resolve(
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma"
  );
  const result = spawnSync(
    executable,
    ["migrate", "resolve", "--applied", migration],
    { stdio: "inherit", env: process.env }
  );
  if (result.status !== 0) {
    throw new Error(`Unable to mark ${migration} as applied`);
  }
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {});
  if (parsed.positionals.length > 0) throw new Error("No arguments are accepted");

  const tables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  const tableNames = new Set(tables.map((table) => table.name));
  const requiredTables = [
    "Recipient",
    "Bin",
    "Package",
    "User",
    "ReferralCode",
    "Session",
    "Account",
    "Verification",
  ];
  const missingTables = requiredTables.filter((table) => !tableNames.has(table));
  if (missingTables.length > 0) {
    throw new Error(
      `Database does not match the ParcelHub baseline; missing: ${missingTables.join(", ")}`
    );
  }

  if (tableNames.has("_prisma_migrations")) {
    const applied = await prisma.$queryRawUnsafe<Array<{ migration_name: string }>>(
      "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL"
    );
    if (applied.some((migration) => migration.migration_name === BASELINE)) {
      console.log("Migration history is already baselined; no changes made.");
      return;
    }
  }

  const userColumns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "PRAGMA table_info('User')"
  );
  const referralColumns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "PRAGMA table_info('ReferralCode')"
  );
  const binColumns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "PRAGMA table_info('Bin')"
  );
  const hasDisabledAt = userColumns.some((column) => column.name === "disabledAt");
  const hasDisabledReason = userColumns.some(
    (column) => column.name === "disabledReason"
  );
  const hasRevokedAt = referralColumns.some((column) => column.name === "revokedAt");
  const accountControlsPresent =
    hasDisabledAt && hasDisabledReason && hasRevokedAt;
  const accountControlsAbsent =
    !hasDisabledAt && !hasDisabledReason && !hasRevokedAt;
  if (!accountControlsPresent && !accountControlsAbsent) {
    throw new Error(
      "Database has a partial account-controls schema; resolve it manually before baselining"
    );
  }

  const defaultBinPresent = binColumns.some(
    (column) => column.name === "isDefault"
  );
  if (defaultBinPresent) {
    const defaultBin = await ensureDefaultBin(prisma);
    await prisma.package.updateMany({
      where: { binId: null },
      data: { binId: defaultBin.id },
    });
    await prisma.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "Bin_single_default_idx" ON "Bin"("isDefault") WHERE "isDefault" = true'
    );
  }

  await prisma.$disconnect();
  applyResolution(BASELINE);
  if (accountControlsPresent) applyResolution(ACCOUNT_CONTROLS);
  if (defaultBinPresent) applyResolution(DEFAULT_BIN);
  console.log(
    `Marked the baseline${accountControlsPresent ? ", account controls" : ""}${defaultBinPresent ? ", and default-bin schema" : ""} as applied. Run npm run db:migrate:deploy next.`
  );
}

runCommand(USAGE, main);
