import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export default function RequireAuth() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return <Outlet />;
}
