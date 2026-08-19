import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to request a password reset");
      } else {
        setIsSent(true);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to request a password reset"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Mail className="size-5" />
          </div>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your account email and we will send a single-use reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for that address, a reset link has been sent.
            </p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={submit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                Send reset link
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            to="/auth"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
