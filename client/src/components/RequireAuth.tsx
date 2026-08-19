import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth-client";

export default function RequireAuth() {
  const { t } = useTranslation();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {t("common.status.checkingSession")}
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return <Outlet />;
}
