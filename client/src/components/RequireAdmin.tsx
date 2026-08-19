import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authClient, getUserRole } from "@/lib/auth-client";

export default function RequireAdmin() {
  const { t } = useTranslation();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        {t("common.status.checkingAccess")}
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  if (getUserRole(session.user.role) !== "ADMIN") {
    return <Navigate to="/my-packages" replace />;
  }

  return <Outlet />;
}
