ALTER TABLE "Bin" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- Adopt an existing Uncategorized bin when one is already present.
UPDATE "Bin"
SET "isDefault" = true
WHERE "id" = (
  SELECT "id"
  FROM "Bin"
  WHERE lower("label") = lower('Uncategorized')
  ORDER BY "createdAt" ASC
  LIMIT 1
);

-- Otherwise create the permanent fallback bin.
INSERT INTO "Bin" (
  "id",
  "label",
  "description",
  "capacity",
  "isDefault",
  "createdAt"
)
SELECT
  'system-bin-uncategorized',
  'Uncategorized',
  'Packages without an assigned storage bin',
  9999,
  true,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Bin" WHERE "isDefault" = true);

-- Existing unassigned packages now belong to the default bin.
UPDATE "Package"
SET "binId" = (SELECT "id" FROM "Bin" WHERE "isDefault" = true LIMIT 1)
WHERE "binId" IS NULL;

CREATE UNIQUE INDEX "Bin_single_default_idx"
ON "Bin"("isDefault")
WHERE "isDefault" = true;
