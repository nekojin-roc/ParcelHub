import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

const STATUS_DETAILS = {
  RECEIVED: {
    labelKey: "myPackages.status.received.label",
    descriptionKey: "myPackages.status.received.description",
    variant: "warning",
  },
  NOTIFIED: {
    labelKey: "myPackages.status.notified.label",
    descriptionKey: "myPackages.status.notified.description",
    variant: "default",
  },
  PICKED_UP: {
    labelKey: "myPackages.status.pickedUp.label",
    descriptionKey: "myPackages.status.pickedUp.description",
    variant: "success",
  },
} as const satisfies Record<
  Package["status"],
  {
    labelKey: string;
    descriptionKey: string;
    variant: "warning" | "default" | "success";
  }
>;

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function UserPackageCard({ pkg }: { pkg: Package }) {
  const { t, i18n } = useTranslation();
  const status = STATUS_DETAILS[pkg.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate font-mono text-base">
              {pkg.barcode}
            </CardTitle>
            <CardDescription>{t(status.descriptionKey)}</CardDescription>
          </div>
          <Badge variant={status.variant}>{t(status.labelKey)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        {pkg.photoPath && (
          <img
            src={api.packagePhotoUrl(pkg.id, pkg.photoPath)}
            alt={t("myPackages.photoAlt", { barcode: pkg.barcode })}
            className="h-36 w-full rounded-lg border object-cover sm:w-44"
          />
        )}
        <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">{t("myPackages.fields.description")}</dt>
            <dd className="font-medium">
              {pkg.description || t("myPackages.packageFallback")}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">{t("myPackages.fields.received")}</dt>
            <dd>{formatDate(pkg.receivedAt, i18n.resolvedLanguage ?? i18n.language)}</dd>
          </div>
          {pkg.trackingNumber && (
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">
                {t("myPackages.fields.trackingNumber")}
              </dt>
              <dd className="break-all font-mono">{pkg.trackingNumber}</dd>
            </div>
          )}
          {pkg.bin && pkg.status !== "PICKED_UP" && (
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">
                {t("myPackages.fields.storageLocation")}
              </dt>
              <dd>
                {t("packages.bin", {
                  label: pkg.bin.isDefault
                    ? t("common.storageBins.uncategorized.label")
                    : pkg.bin.label,
                })}
              </dd>
            </div>
          )}
          {pkg.status === "PICKED_UP" && (
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">{t("myPackages.fields.pickedUp")}</dt>
              <dd>{formatDate(pkg.pickedUpAt, i18n.resolvedLanguage ?? i18n.language)}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

export default function MyPackagesPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-packages"],
    queryFn: api.myPackages,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t("myPackages.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("myPackages.errorTitle")}</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data?.recipient) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("myPackages.title")}</h1>
          <p className="text-muted-foreground">{t("myPackages.description")}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("myPackages.noProfileTitle")}</CardTitle>
            <CardDescription>
              {t("myPackages.noProfileDescription")}
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
        <h1 className="text-2xl font-bold tracking-tight">{t("myPackages.title")}</h1>
        <p className="text-muted-foreground">
          {t("myPackages.recipientDescription", { name: data.recipient.name })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">{t("myPackages.metrics.waiting")}</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{currentPackages.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">{t("myPackages.metrics.pickedUp")}</CardTitle>
            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{pickupHistory.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">{t("myPackages.metrics.total")}</CardTitle>
            <Archive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data.packages.length}</CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t("myPackages.sections.current")}</h2>
        {currentPackages.length ? (
          currentPackages.map((pkg) => <UserPackageCard key={pkg.id} pkg={pkg} />)
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t("myPackages.sections.empty")}
            </CardContent>
          </Card>
        )}
      </section>

      {pickupHistory.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t("myPackages.sections.history")}</h2>
          {pickupHistory.map((pkg) => (
            <UserPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </section>
      )}
    </div>
  );
}
