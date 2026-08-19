import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Bin management
  const [binLabel, setBinLabel] = useState("");
  const [binDesc, setBinDesc] = useState("");

  const { data: bins } = useQuery({
    queryKey: ["bins"],
    queryFn: api.listBins,
  });

  const createBin = useMutation({
    mutationFn: api.createBin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins"] });
      setBinLabel("");
      setBinDesc("");
    },
  });

  const deleteBin = useMutation({
    mutationFn: api.deleteBin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins"] });
    },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      {/* Bin management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.bins.title")}</CardTitle>
          <CardDescription>
            {t("settings.bins.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing bins */}
          {bins && bins.length > 0 && (
            <div className="space-y-2">
              {bins.map((bin) => {
                const label = bin.isDefault
                  ? t("common.storageBins.uncategorized.label")
                  : bin.label;
                const description = bin.isDefault
                  ? t("common.storageBins.uncategorized.description")
                  : bin.description;

                return (
                  <div
                    key={bin.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{label}</span>
                      {bin.isDefault && (
                        <Badge variant="secondary">
                          {t("settings.bins.defaultBadge")}
                        </Badge>
                      )}
                      {description && (
                        <span className="text-sm text-muted-foreground">
                          {description}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        ({bin.currentCount ?? 0}/{bin.capacity})
                      </span>
                    </div>
                    {!bin.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(t("settings.bins.confirmDelete", { label: bin.label }))) {
                            deleteBin.mutate(bin.id);
                          }
                        }}
                      >
                        <span className="sr-only">{t("settings.bins.deleteLabel", { label: bin.label })}</span>
                        <Trash2 data-icon="inline-start" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new bin */}
          <div className="flex gap-2">
            <Input
              placeholder={t("settings.bins.labelPlaceholder")}
              value={binLabel}
              onChange={(e) => setBinLabel(e.target.value)}
              className="w-32"
            />
            <Input
              placeholder={t("settings.bins.descriptionPlaceholder")}
              value={binDesc}
              onChange={(e) => setBinDesc(e.target.value)}
              className="flex-1"
            />
            <Button
              aria-label={t("settings.bins.addLabel")}
              onClick={() =>
                createBin.mutate({
                  label: binLabel,
                  description: binDesc || undefined,
                })
              }
              disabled={!binLabel || createBin.isPending}
            >
              {createBin.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          {createBin.isError && (
            <p className="text-sm text-destructive">
              {createBin.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Email / SMTP info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.email.title")}</CardTitle>
          <CardDescription>
            {t("settings.email.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("settings.email.current")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
