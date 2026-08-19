ALTER TABLE "User" ADD COLUMN "disabledAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "disabledReason" TEXT;
ALTER TABLE "ReferralCode" ADD COLUMN "revokedAt" DATETIME;
CREATE INDEX "ReferralCode_revokedAt_idx" ON "ReferralCode"("revokedAt");
