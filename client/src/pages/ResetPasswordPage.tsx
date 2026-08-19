import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(t("auth.reset.invalidShort"));
      return;
    }
    if (password !== confirmation) {
      setError(t("auth.reset.mismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(result.error.message ?? t("auth.reset.error"));
      } else {
        setIsComplete(true);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t("auth.reset.error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const invalidLink = !token || Boolean(linkError);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <KeyRound className="size-5" />
          </div>
          <CardTitle>{t("auth.reset.title")}</CardTitle>
          <CardDescription>
            {isComplete
              ? t("auth.reset.updated")
              : t("auth.reset.instructions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isComplete ? (
            <p className="text-sm text-muted-foreground">
              {t("auth.reset.complete")}
            </p>
          ) : invalidLink ? (
            <p className="text-sm text-destructive">
              {t("auth.reset.invalid")}
            </p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={submit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password">{t("auth.reset.newPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">
                  {t("auth.reset.confirmPassword")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                {t("auth.reset.action")}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            to={invalidLink ? "/forgot-password" : "/auth"}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {invalidLink ? t("auth.reset.requestNew") : t("auth.forgot.back")}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
