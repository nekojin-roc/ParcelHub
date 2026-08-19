import {
  optionString,
  parseArguments,
  prisma,
  requireConfirmation,
  requiredOption,
  runCommand,
} from "./cli.js";
import { normalizeReferralCode } from "../utils/referral-code.js";

const USAGE =
  "Usage: npm run referral:revoke -- --code <code> --confirm <code>";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {
    code: "string",
    confirm: "string",
  });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const code = normalizeReferralCode(requiredOption(parsed, "code"));
  if (!code) throw new Error("--code is required");
  const confirmation = normalizeReferralCode(optionString(parsed, "confirm"));
  if (confirmation !== code) requireConfirmation(parsed, code);

  const referral = await prisma.referralCode.findUnique({
    where: { code },
    select: { usedAt: true, revokedAt: true },
  });
  if (!referral) throw new Error(`Referral code ${code} does not exist`);
  if (referral.revokedAt) {
    console.log(`${code} is already revoked; no changes made.`);
    return;
  }
  if (referral.usedAt) {
    throw new Error(`${code} has already been used and cannot be revoked`);
  }

  await prisma.referralCode.update({
    where: { code },
    data: { revokedAt: new Date() },
  });
  console.log(`Revoked referral code ${code}.`);
}

runCommand(USAGE, main);
