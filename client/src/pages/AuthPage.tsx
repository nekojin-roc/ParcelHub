import { useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LockKeyhole } from "lucide-react";

type AuthMode = "sign-in" | "sign-up";

export default function AuthPage() {
  const { t } = useTranslation();
  const { data: session, isPending: isCheckingSession } = authClient.useSession();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckingSession && session) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name,
              email,
              password,
              referralCode: referralCode.trim().toUpperCase() || undefined,
              callbackURL: `${window.location.origin}/auth?verified=true`,
            })
          : await authClient.signIn.email({ email, password });

      if (result.error) setError(result.error.message ?? t("auth.unableToContinue"));
    } catch (error) {
      setError(error instanceof Error ? error.message : t("auth.unableToContinue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignUp = mode === "sign-up";
  const verificationError = searchParams.get("error");
  const wasVerified =
    !verificationError && searchParams.get("verified") === "true";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <LockKeyhole className="size-5" />
          </div>
          <CardTitle>ParcelHub</CardTitle>
          <CardDescription>
            {isSignUp
              ? t("auth.signUpDescription")
              : t("auth.signInDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={mode === "sign-in" ? "secondary" : "ghost"}
              onClick={() => {
                setMode("sign-in");
                setError(null);
              }}
            >
              {t("auth.signIn")}
            </Button>
            <Button
              type="button"
              variant={mode === "sign-up" ? "secondary" : "ghost"}
              onClick={() => {
                setMode("sign-up");
                setError(null);
              }}
            >
              {t("auth.createAccount")}
            </Button>
          </div>

          <form className="flex flex-col gap-4" onSubmit={submit}>
            {wasVerified && (
              <p className="text-sm text-foreground">
                {t("auth.verificationSuccess")}
              </p>
            )}
            {verificationError && (
              <p className="text-sm text-destructive">
                {t("auth.verificationError")}
              </p>
            )}
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="referral-code">{t("auth.referralCode")}</Label>
                <Input
                  id="referral-code"
                  autoComplete="off"
                  autoCapitalize="characters"
                  placeholder="PH-XXXX-XXXX"
                  value={referralCode}
                  onChange={(event) =>
                    setReferralCode(event.target.value.toUpperCase())
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {t("auth.referralHelp")}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">{t("auth.password")}</Label>
                {!isSignUp && (
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">{t("auth.passwordHelp")}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              {isSignUp ? t("auth.createAccount") : t("auth.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
