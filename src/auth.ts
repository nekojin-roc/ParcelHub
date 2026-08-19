import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  sendEmailVerification,
  sendPasswordReset,
} from "./services/email.js";
import { prisma } from "./utils/prisma.js";
import { normalizeReferralCode } from "./utils/referral-code.js";

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

export const USER_ROLES = ["ADMIN", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  trustedOrigins: [clientUrl],
  emailVerification: {
    // Verification is a one-time signup notification. It is intentionally not
    // required for sign-in and is never re-sent as part of a sign-in attempt.
    sendOnSignUp: true,
    sendOnSignIn: false,
    expiresIn: 60 * 60 * 24,
    async sendVerificationEmail({ user, url }) {
      await sendEmailVerification({
        name: user.name,
        email: user.email,
        verificationUrl: url,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await sendPasswordReset({
        name: user.name,
        email: user.email,
        resetUrl: url,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["ADMIN", "USER"],
        required: false,
        defaultValue: "USER",
        input: false,
        returned: true,
      },
      referralCode: {
        type: "string",
        required: false,
        input: true,
        returned: false,
        unique: true,
        transform: {
          input: normalizeReferralCode,
        },
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const isFirstAccount = (await prisma.user.count()) === 0;
          const referralCode = normalizeReferralCode(user.referralCode);

          if (!isFirstAccount) {
            if (!referralCode) {
              throw APIError.from("BAD_REQUEST", {
                code: "REFERRAL_CODE_REQUIRED",
                message: "A referral code is required to create an account",
              });
            }

            const activeCode = await prisma.referralCode.findFirst({
              where: {
                code: referralCode,
                usedAt: null,
                usedBy: null,
              },
              select: { id: true },
            });
            if (!activeCode) {
              throw APIError.from("BAD_REQUEST", {
                code: "INVALID_REFERRAL_CODE",
                message: "This referral code is invalid or has already been used",
              });
            }
          }

          return {
            data: {
              ...user,
              role: isFirstAccount ? "ADMIN" : "USER",
              referralCode: isFirstAccount ? null : referralCode,
            },
          };
        },
        after: async (user) => {
          const referralCode = normalizeReferralCode(user.referralCode);
          if (!referralCode) return;

          await prisma.referralCode.updateMany({
            where: { code: referralCode, usedAt: null },
            data: { usedAt: new Date() },
          });
        },
      },
      update: {
        before: async (user) => {
          if (!("referralCode" in user)) return;

          const { referralCode: _ignored, ...data } = user;
          return { data };
        },
      },
    },
  },
});

// When roles are introduced to an installation that already has accounts,
// retain access by promoting the oldest account if no admin exists yet.
export async function ensureAdminExists(): Promise<void> {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) return;

  const oldestUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (oldestUser) {
    await prisma.user.update({
      where: { id: oldestUser.id },
      data: { role: "ADMIN" },
    });
  }
}
