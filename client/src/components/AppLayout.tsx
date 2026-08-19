import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  PackagePlus,
  ScanBarcode,
  Users,
  Archive,
  Settings,
  LogOut,
  PackageSearch,
  UserRoundCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient, getUserRole } from "@/lib/auth-client";

const adminNavItems = [
  { to: "/", icon: LayoutDashboard, labelKey: "navigation.dashboard" },
  { to: "/intake", icon: PackagePlus, labelKey: "navigation.intake" },
  { to: "/pickup", icon: ScanBarcode, labelKey: "navigation.pickup" },
  { to: "/packages", icon: Archive, labelKey: "navigation.packages" },
  { to: "/recipients", icon: Users, labelKey: "navigation.recipients" },
  { to: "/users", icon: UserRoundCog, labelKey: "navigation.users" },
  { to: "/settings", icon: Settings, labelKey: "navigation.settings" },
] as const;

const userNavItems = [
  { to: "/my-packages", icon: PackageSearch, labelKey: "navigation.myPackages" },
] as const;

export default function AppLayout() {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const role = getUserRole(session?.user.role);
  const navItems = role === "ADMIN" ? adminNavItems : userNavItems;

  const signOut = async () => {
    await authClient.signOut();
    window.location.assign("/auth");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-sidebar-background">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-bold tracking-tight">
            ParcelHub
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <Icon className="size-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-3 border-t p-3">
          <div className="min-w-0 px-3">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{session?.user.name}</p>
              <Badge variant="secondary">
                {role === "ADMIN" ? t("common.roles.admin") : t("common.roles.user")}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
          <Button variant="ghost" className="justify-start" onClick={signOut}>
            <LogOut data-icon="inline-start" />
            {t("common.actions.signOut")}
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex md:hidden h-14 items-center border-b px-4 gap-4 overflow-x-auto">
          <span className="text-lg font-bold tracking-tight shrink-0">
            ParcelHub
          </span>
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium shrink-0 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )
              }
            >
              <Icon className="size-3.5" />
              {t(labelKey)}
            </NavLink>
          ))}
          <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={signOut}>
            <LogOut data-icon="inline-start" />
            {t("common.actions.signOut")}
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
