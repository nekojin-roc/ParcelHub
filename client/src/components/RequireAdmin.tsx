import { Navigate, Outlet } from "react-router-dom";
import { authClient, getUserRole } from "@/lib/auth-client";

export default function RequireAdmin() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        Checking access...
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  if (getUserRole(session.user.role) !== "ADMIN") {
    return <Navigate to="/my-packages" replace />;
  }

  return <Outlet />;
}
