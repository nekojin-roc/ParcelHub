import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "127.0.0.1",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: process.env.SMTP_SECURE === "true",
  ...(smtpUser && smtpPass
    ? {
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }
    : {}),
});

const fromAddress =
  process.env.SMTP_FROM?.trim() ||
  smtpUser ||
  "ParcelHub <no-reply@parcelhub.local>";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await transporter.sendMail({
    from: fromAddress,
    ...options,
  });
}

export async function verifyEmailTransport(): Promise<void> {
  await transporter.verify();
}

export async function sendTestEmail(recipientEmail: string): Promise<void> {
  const sentAt = new Date().toISOString();
  await sendMail({
    to: recipientEmail,
    subject: "ParcelHub SMTP test",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>ParcelHub SMTP test succeeded</h2>
        <p>This message was sent by the host-side mail:test command.</p>
        <p style="color: #666; font-size: 14px;">Sent at ${escapeHtml(sentAt)}</p>
      </div>
    `,
  });
}

export async function sendEmailVerification(params: {
  name: string;
  email: string;
  verificationUrl: string;
}): Promise<void> {
  const name = escapeHtml(params.name);
  const verificationUrl = escapeHtml(params.verificationUrl);

  await sendMail({
    to: params.email,
    subject: "Verify your ParcelHub email",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Hi ${name}, thanks for creating a ParcelHub account.</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 6px; background: #18181b; color: #fff; text-decoration: none;">
            Verify email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 24 hours. Verification is requested once after
          signup and does not block you from signing in.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordReset(params: {
  name: string;
  email: string;
  resetUrl: string;
}): Promise<void> {
  const name = escapeHtml(params.name);
  const resetUrl = escapeHtml(params.resetUrl);

  await sendMail({
    to: params.email,
    subject: "Reset your ParcelHub password",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name}, use the link below to choose a new ParcelHub password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 6px; background: #18181b; color: #fff; text-decoration: none;">
            Reset password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This single-use link expires in one hour. If you did not request a
          password reset, you can ignore this message.
        </p>
      </div>
    `,
  });
}

interface NotifyArrivalParams {
  recipientName: string;
  recipientEmail: string;
  packageBarcode: string;
  description?: string | null;
  binLabel?: string | null;
  orderNumber?: string | null;
}

export async function sendArrivalNotification(
  params: NotifyArrivalParams
): Promise<boolean> {
  const {
    recipientName,
    recipientEmail,
    packageBarcode,
    description,
    binLabel,
    orderNumber,
  } = params;

  const safeRecipientName = escapeHtml(recipientName);
  const safeBarcode = escapeHtml(packageBarcode);
  const safeDescription = description ? escapeHtml(description) : null;
  const safeBinLabel = binLabel ? escapeHtml(binLabel) : null;
  const safeOrderNumber = orderNumber ? escapeHtml(orderNumber) : null;

  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>Hey ${safeRecipientName}, you have a package!</h2>
      <p>A package has arrived and is being held for you.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Barcode</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-family: monospace;">${safeBarcode}</td>
        </tr>
        ${safeDescription ? `<tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Description</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${safeDescription}</td></tr>` : ""}
        ${safeOrderNumber ? `<tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Order #</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${safeOrderNumber}</td></tr>` : ""}
        ${safeBinLabel ? `<tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Stored in</td><td style="padding: 8px; border-bottom: 1px solid #eee;">Bin ${safeBinLabel}</td></tr>` : ""}
      </table>
      <p style="color: #666; font-size: 14px;">
        Please arrange pickup at your earliest convenience.
      </p>
    </div>
  `;

  try {
    await sendMail({
      to: recipientEmail,
      subject: `Package arrived for you [${packageBarcode}]`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

export async function sendPickupConfirmation(params: {
  recipientName: string;
  recipientEmail: string;
  packageBarcode: string;
  collectedBy?: string | null;
}): Promise<boolean> {
  const recipientName = escapeHtml(params.recipientName);
  const packageBarcode = escapeHtml(params.packageBarcode);
  const collectedBy = params.collectedBy
    ? escapeHtml(params.collectedBy)
    : null;
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>Package picked up</h2>
      <p>Hi ${recipientName}, your package <strong>${packageBarcode}</strong> has been collected${collectedBy ? ` by ${collectedBy}` : ""}.</p>
    </div>
  `;

  try {
    await sendMail({
      to: params.recipientEmail,
      subject: `Package collected [${params.packageBarcode}]`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send pickup email:", err);
    return false;
  }
}
