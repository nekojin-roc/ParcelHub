import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PackagePlus,
  ScanBarcode,
  Users,
  Archive,
  Settings,
  LogOut,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient, getUserRole } from "@/lib/auth-client";

const adminNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/intake", icon: PackagePlus, label: "Intake" },
  { to: "/pickup", icon: ScanBarcode, label: "Pickup" },
  { to: "/packages", icon: Archive, label: "Packages" },
  { to: "/recipients", icon: Users, label: "Recipients" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const userNavItems = [
  { to: "/my-packages", icon: PackageSearch, label: "My Packages" },
];

export default function AppLayout() {
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
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
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
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-3 border-t p-3">
          <div className="min-w-0 px-3">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{session?.user.name}</p>
              <Badge variant="secondary">
                {role === "ADMIN" ? "Admin" : "User"}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
          <Button variant="ghost" className="justify-start" onClick={signOut}>
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex md:hidden h-14 items-center border-b px-4 gap-4 overflow-x-auto">
          <span className="text-lg font-bold tracking-tight shrink-0">
            ParcelHub
          </span>
          {navItems.map(({ to, icon: Icon, label }) => (
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
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
          <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={signOut}>
            <LogOut data-icon="inline-start" />
            Sign out
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
