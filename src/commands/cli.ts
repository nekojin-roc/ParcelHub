import path from "node:path";
import { prisma } from "../utils/prisma.js";

export { prisma };

type OptionKind = "boolean" | "string";

export type ParsedArguments = {
  options: Record<string, string | boolean>;
  positionals: string[];
};

export function parseArguments(
  args: string[],
  schema: Record<string, OptionKind>
): ParsedArguments {
  const options: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith("--")) {
      positionals.push(argument);
      continue;
    }

    const separator = argument.indexOf("=");
    const name = argument.slice(2, separator === -1 ? undefined : separator);
    const kind = schema[name];
    if (!kind) throw new Error(`Unknown option: --${name}`);

    if (kind === "boolean") {
      if (separator !== -1) {
        throw new Error(`--${name} does not accept a value`);
      }
      options[name] = true;
      continue;
    }

    const value =
      separator === -1 ? args[index + 1] : argument.slice(separator + 1);
    if (!value || (separator === -1 && value.startsWith("--"))) {
      throw new Error(`--${name} requires a value`);
    }
    options[name] = value;
    if (separator === -1) index += 1;
  }

  return { options, positionals };
}

export function optionString(
  parsed: ParsedArguments,
  name: string
): string | undefined {
  const value = parsed.options[name];
  return typeof value === "string" ? value.trim() : undefined;
}

export function requiredOption(
  parsed: ParsedArguments,
  name: string
): string {
  const value = optionString(parsed, name);
  if (!value) throw new Error(`--${name} is required`);
  return value;
}

export function optionEnabled(
  parsed: ParsedArguments,
  name: string
): boolean {
  return parsed.options[name] === true;
}

export function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Invalid email address: ${email || "(empty)"}`);
  }
  return email;
}

export function requireConfirmation(
  parsed: ParsedArguments,
  expected: string
): void {
  if (optionString(parsed, "confirm") !== expected) {
    throw new Error(`Refusing operation without --confirm ${expected}`);
  }
}

export function sqlitePathFromEnvironment(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a SQLite file: URL");
  }

  const filename = databaseUrl.slice("file:".length).split("?")[0];
  if (!filename) throw new Error("DATABASE_URL does not contain a file path");
  return path.isAbsolute(filename)
    ? path.normalize(filename)
    : path.resolve(process.cwd(), "prisma", filename);
}

export async function connectedSqlitePath(): Promise<string> {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ name: string; file: string }>
  >("PRAGMA database_list");
  const main = rows.find((row) => row.name === "main");
  if (!main?.file) throw new Error("Unable to resolve the connected database file");
  return path.resolve(main.file);
}

export function runCommand(
  usage: string,
  command: () => Promise<void>
): void {
  command()
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      if (usage) console.error(`\n${usage}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
