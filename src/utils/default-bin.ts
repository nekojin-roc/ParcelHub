import type { PrismaClient } from "@prisma/client";

export const DEFAULT_BIN_ID = "system-bin-uncategorized";
export const DEFAULT_BIN_LABEL = "Uncategorized";
export const DEFAULT_BIN_DESCRIPTION =
  "Packages without an assigned storage bin";
export const DEFAULT_BIN_CAPACITY = 9999;

export async function ensureDefaultBin(prisma: PrismaClient) {
  const currentDefault = await prisma.bin.findFirst({
    where: { isDefault: true },
  });
  if (currentDefault) return currentDefault;

  const matchingBin = await prisma.bin.findUnique({
    where: { label: DEFAULT_BIN_LABEL },
  });
  if (matchingBin) {
    return prisma.bin.update({
      where: { id: matchingBin.id },
      data: { isDefault: true },
    });
  }

  return prisma.bin.create({
    data: {
      id: DEFAULT_BIN_ID,
      label: DEFAULT_BIN_LABEL,
      description: DEFAULT_BIN_DESCRIPTION,
      capacity: DEFAULT_BIN_CAPACITY,
      isDefault: true,
    },
  });
}
