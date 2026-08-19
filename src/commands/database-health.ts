import { PrismaClient } from "@prisma/client";

export type DatabaseHealth = {
  integrity: string[];
  foreignKeyViolations: Array<Record<string, unknown>>;
};

function rowValues(rows: Array<Record<string, unknown>>): string[] {
  return rows.flatMap((row) => Object.values(row).map(String));
}

export async function checkDatabase(
  client: PrismaClient,
  quick = false
): Promise<DatabaseHealth> {
  const integrityRows = await client.$queryRawUnsafe<
    Array<Record<string, unknown>>
  >(`PRAGMA ${quick ? "quick_check" : "integrity_check"}`);
  const foreignKeyViolations = await client.$queryRawUnsafe<
    Array<Record<string, unknown>>
  >("PRAGMA foreign_key_check");
  return {
    integrity: rowValues(integrityRows),
    foreignKeyViolations,
  };
}

export function databaseIsHealthy(health: DatabaseHealth): boolean {
  return (
    health.integrity.length === 1 &&
    health.integrity[0] === "ok" &&
    health.foreignKeyViolations.length === 0
  );
}
