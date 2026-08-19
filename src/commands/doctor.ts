import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import {
  optionEnabled,
  parseArguments,
  prisma,
  runCommand,
} from "./cli.js";
import { checkDatabase, databaseIsHealthy } from "./database-health.js";
import { verifyEmailTransport } from "../services/email.js";

const USAGE = "Usage: npm run ops:doctor -- [--skip-smtp]";

type Status = "PASS" | "WARN" | "FAIL";
type CheckResult = { check: string; status: Status; detail: string };

function validUrl(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {
    "skip-smtp": "boolean",
  });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const production = process.env.NODE_ENV === "production";
  const results: CheckResult[] = [];
  const record = (check: string, status: Status, detail: string) => {
    results.push({ check, status, detail });
  };

  const [major, minor] = process.versions.node.split(".").map(Number);
  const supportedNode = major > 20 || (major === 20 && minor >= 19);
  record(
    "Node.js",
    supportedNode ? "PASS" : "FAIL",
    `${process.versions.node}; requires >=20.19`
  );
  record(
    "NODE_ENV",
    production ? "PASS" : "WARN",
    production ? "production" : process.env.NODE_ENV || "not set"
  );

  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  const secureSecret =
    Boolean(secret) &&
    secret !== "replace-with-a-long-random-secret" &&
    secret!.length >= 32;
  record(
    "Auth secret",
    secureSecret ? "PASS" : "FAIL",
    secureSecret ? "configured" : "missing, placeholder, or shorter than 32 characters"
  );

  for (const [name, value] of [
    ["BETTER_AUTH_URL", process.env.BETTER_AUTH_URL],
    ["CLIENT_URL", process.env.CLIENT_URL],
  ] as const) {
    const url = validUrl(value);
    const httpsRequired = production && url?.hostname !== "localhost";
    record(
      name,
      !url || (httpsRequired && url.protocol !== "https:") ? "FAIL" : "PASS",
      !url
        ? "missing or invalid"
        : httpsRequired && url.protocol !== "https:"
          ? `${url.origin}; HTTPS required in production`
          : url.origin
    );
  }

  try {
    const health = await checkDatabase(prisma, true);
    record(
      "Database integrity",
      databaseIsHealthy(health) ? "PASS" : "FAIL",
      databaseIsHealthy(health)
        ? "quick_check ok; no foreign-key violations"
        : `${health.integrity.join(", ")}; ${health.foreignKeyViolations.length} foreign-key violation(s)`
    );

    const activeAdministrators = await prisma.user.count({
      where: { role: "ADMIN", disabledAt: null },
    });
    record(
      "Active administrators",
      activeAdministrators > 0 ? "PASS" : "FAIL",
      String(activeAdministrators)
    );

    const migrationTable = await prisma.$queryRawUnsafe<
      Array<{ name: string }>
    >("SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations'");
    record(
      "Migration history",
      migrationTable.length > 0 ? "PASS" : production ? "FAIL" : "WARN",
      migrationTable.length > 0 ? "initialized" : "not initialized"
    );
  } catch (error) {
    record(
      "Database",
      "FAIL",
      error instanceof Error ? error.message : String(error)
    );
  }

  const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "uploads");
  try {
    const metadata = await stat(uploadRoot);
    if (!metadata.isDirectory()) throw new Error("path is not a directory");
    await access(uploadRoot, constants.R_OK | constants.W_OK);
    record("Upload storage", "PASS", `${uploadRoot}; readable and writable`);
  } catch (error) {
    record(
      "Upload storage",
      "WARN",
      `${uploadRoot}; ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (optionEnabled(parsed, "skip-smtp")) {
    record("SMTP", "WARN", "skipped by operator");
  } else {
    try {
      await verifyEmailTransport();
      record("SMTP", "PASS", `${process.env.SMTP_HOST ?? "127.0.0.1"}:${process.env.SMTP_PORT ?? "1025"}`);
    } catch (error) {
      record("SMTP", "FAIL", error instanceof Error ? error.message : String(error));
    }
  }

  console.table(results);
  const failures = results.filter((result) => result.status === "FAIL").length;
  const warnings = results.filter((result) => result.status === "WARN").length;
  console.log(`Doctor completed with ${failures} failure(s) and ${warnings} warning(s).`);
  if (failures > 0) throw new Error("ParcelHub is not ready for production");
}

runCommand(USAGE, main);
