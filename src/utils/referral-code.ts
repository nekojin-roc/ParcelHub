import { randomBytes } from "node:crypto";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

export function generateReferralCode(): string {
  const bytes = randomBytes(8);
  const characters = Array.from(
    bytes,
    (byte) => REFERRAL_ALPHABET[byte & 31]
  );
  return `PH-${characters.slice(0, 4).join("")}-${characters
    .slice(4)
    .join("")}`;
}
