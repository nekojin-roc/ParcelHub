import { useQuery } from "@tanstack/react-query";
import { api, type Package } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Archive, Clock, PackageCheck } from "lucide-react";

const STATUS_DETAILS: Record<
  Package["status"],
  {
    label: string;
    description: string;
    variant: "warning" | "default" | "success";
  }
> = {
  RECEIVED: {
    label: "Received",
    description: "Your package has arrived and is being prepared for pickup.",
    variant: "warning",
  },
  NOTIFIED: {
    label: "Ready for pickup",
    description: "Your package is ready to be collected.",
    variant: "default",
  },
  PICKED_UP: {
    label: "Picked up",
    description: "This package has been collected.",
    variant: "success",
  },
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function UserPackageCard({ pkg }: { pkg: Package }) {
  const status = STATUS_DETAILS[pkg.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate font-mono text-base">
              {pkg.barcode}
            </CardTitle>
            <CardDescription>{status.description}</CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        {pkg.photoPath && (
          <img
            src={api.packagePhotoUrl(pkg.id, pkg.photoPath)}
            alt={`Package ${pkg.barcode}`}
            className="h-36 w-full rounded-lg border object-cover sm:w-44"
          />
        )}
        <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Description</dt>
            <dd className="font-medium">{pkg.description || "Package"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Received</dt>
            <dd>{formatDate(pkg.receivedAt)}</dd>
          </div>
          {pkg.trackingNumber && (
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Tracking number</dt>
              <dd className="break-all font-mono">{pkg.trackingNumber}</dd>
            </div>
          )}
          {pkg.bin && pkg.status !== "PICKED_UP" && (
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Storage location</dt>
              <dd>Bin {pkg.bin.label}</dd>
            </div>
          )}
          {pkg.status === "PICKED_UP" && (
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Picked up</dt>
              <dd>{formatDate(pkg.pickedUpAt)}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

export default function MyPackagesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-packages"],
    queryFn: api.myPackages,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading your packages...
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to load packages</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data?.recipient) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Packages</h1>
          <p className="text-muted-foreground">Track packages being held for you.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No recipient profile linked</CardTitle>
            <CardDescription>
              Ask an administrator to link this account to your recipient
              profile. Your packages will appear here after it is connected.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPackages = data.packages.filter((pkg) => pkg.status !== "PICKED_UP");
  const pickupHistory = data.packages.filter((pkg) => pkg.status === "PICKED_UP");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Packages</h1>
        <p className="text-muted-foreground">
          Package status for {data.recipient.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Waiting for pickup</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{currentPackages.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Picked up</CardTitle>
            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{pickupHistory.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Total packages</CardTitle>
            <Archive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data.packages.length}</CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Current packages</h2>
        {currentPackages.length ? (
          currentPackages.map((pkg) => <UserPackageCard key={pkg.id} pkg={pkg} />)
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              You have no packages waiting for pickup.
            </CardContent>
          </Card>
        )}
      </section>

      {pickupHistory.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Pickup history</h2>
          {pickupHistory.map((pkg) => (
            <UserPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </section>
      )}
    </div>
  );
}
