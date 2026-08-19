import {
  normalizeEmail,
  optionString,
  parseArguments,
  prisma,
  requiredOption,
  runCommand,
} from "./cli.js";
import { generateReferralCode } from "../utils/referral-code.js";

const USAGE =
  "Usage: npm run referral:create -- --admin <admin-email> [--count <1-20>]";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), {
    admin: "string",
    count: "string",
  });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const administratorEmail = normalizeEmail(requiredOption(parsed, "admin"));
  const countText = optionString(parsed, "count") ?? "1";
  const count = Number(countText);
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    throw new Error("--count must be an integer between 1 and 20");
  }

  const administrator = await prisma.user.findUnique({
    where: { email: administratorEmail },
    select: { id: true, role: true, disabledAt: true },
  });
  if (!administrator || administrator.role !== "ADMIN") {
    throw new Error(`${administratorEmail} is not an administrator`);
  }
  if (administrator.disabledAt) {
    throw new Error(`${administratorEmail} is disabled`);
  }

  const codes: string[] = [];
  for (let index = 0; index < count; index += 1) {
    let created = false;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const referral = await prisma.referralCode.create({
          data: {
            code: generateReferralCode(),
            createdById: administrator.id,
          },
          select: { code: true },
        });
        codes.push(referral.code);
        created = true;
        break;
      } catch (error) {
        if ((error as { code?: string }).code !== "P2002") throw error;
      }
    }
    if (!created) throw new Error("Unable to generate a unique referral code");
  }

  console.log(codes.join("\n"));
}

runCommand(USAGE, main);
