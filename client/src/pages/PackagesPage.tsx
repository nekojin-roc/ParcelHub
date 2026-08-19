import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

const STATUS_LABELS = {
  RECEIVED: { labelKey: "common.packageStatus.received", variant: "warning" },
  NOTIFIED: { labelKey: "common.packageStatus.notified", variant: "default" },
  PICKED_UP: { labelKey: "common.packageStatus.pickedUp", variant: "success" },
} as const;

export default function PackagesPage() {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [search, setSearch] = useState("");

  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", statusFilter, search],
    queryFn: () => {
      if (statusFilter === "active") {
        // Fetch both RECEIVED and NOTIFIED
        return api.listPackages({ search: search || undefined });
      }
      return api.listPackages({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });
    },
  });

  const filtered =
    statusFilter === "active"
      ? packages?.filter((p) => p.status !== "PICKED_UP")
      : packages;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("packages.title")}</h1>
        <p className="text-muted-foreground">
          {t("packages.description")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("packages.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="active">{t("packages.filters.active")}</SelectItem>
              <SelectItem value="all">{t("packages.filters.all")}</SelectItem>
              <SelectItem value="RECEIVED">{t("common.packageStatus.received")}</SelectItem>
              <SelectItem value="NOTIFIED">{t("common.packageStatus.notified")}</SelectItem>
              <SelectItem value="PICKED_UP">{t("common.packageStatus.pickedUp")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Package list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.status.loading")}</div>
      ) : !filtered?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("packages.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((pkg) => {
            const statusInfo = STATUS_LABELS[pkg.status as keyof typeof STATUS_LABELS];
            return (
              <Card key={pkg.id}>
                <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {pkg.photoPath && (
                    <img
                      src={api.packagePhotoUrl(pkg.id, pkg.photoPath)}
                      alt=""
                      className="size-14 rounded-md border object-cover"
                    />
                  )}
                  {/* Barcode + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {pkg.barcode}
                      </span>
                      <Badge variant={statusInfo?.variant ?? "default"}>
                        {statusInfo ? t(statusInfo.labelKey) : pkg.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {[
                        pkg.description,
                        pkg.orderNumber && t("packages.orderNumber", { orderNumber: pkg.orderNumber }),
                      ]
                        .filter(Boolean)
                        .join(" · ") || t("packages.noDescription")}
                    </p>
                  </div>

                  {/* Recipient + bin */}
                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <span className="font-medium">
                      {pkg.recipient?.name ?? t("common.values.unknown")}
                    </span>
                    {pkg.bin && (
                      <Badge variant="outline" className="text-xs">
                        {t("packages.bin", {
                          label: pkg.bin.isDefault
                            ? t("common.storageBins.uncategorized.label")
                            : pkg.bin.label,
                        })}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {new Intl.DateTimeFormat(i18n.language).format(new Date(pkg.receivedAt))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
