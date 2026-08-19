import {
  normalizeEmail,
  parseArguments,
  requiredOption,
  runCommand,
} from "./cli.js";
import {
  sendTestEmail,
  verifyEmailTransport,
} from "../services/email.js";

const USAGE = "Usage: npm run mail:test -- --to <email>";

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2), { to: "string" });
  if (parsed.positionals.length > 0) throw new Error("Unexpected positional arguments");
  const recipient = normalizeEmail(requiredOption(parsed, "to"));
  await verifyEmailTransport();
  await sendTestEmail(recipient);
  console.log(`SMTP connection succeeded and a test message was sent to ${recipient}.`);
}

runCommand(USAGE, main);
