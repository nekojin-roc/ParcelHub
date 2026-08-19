import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageDetailsForm, {
  type PackageDetails,
} from "@/components/PackageDetailsForm";
import { PackagePlus, Printer, Check } from "lucide-react";

export default function ManualIntakePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Result state after successful intake
  const [result, setResult] = useState<{
    id: string;
    barcode: string;
    recipientName: string;
    notified: boolean;
    photoPath?: string | null;
    photoVersion: number;
    photoError?: string;
  } | null>(null);

  const intakeMutation = useMutation({
    mutationFn: async ({ photo, ...details }: PackageDetails) => {
      let pkg = await api.intake(details);
      let photoError: string | undefined;

      if (photo) {
        try {
          pkg = await api.uploadPackagePhoto(pkg.id, photo);
        } catch (error) {
          photoError =
            error instanceof Error
              ? error.message
              : t("intake.errors.photoUpload");
        }
      }

      return { pkg, photoError };
    },
    onSuccess: ({ pkg, photoError }) => {
      setResult({
        id: pkg.id,
        barcode: pkg.barcode,
        recipientName: pkg.recipient?.name ?? t("common.values.unknown"),
        notified: pkg.status === "NOTIFIED",
        photoPath: pkg.photoPath,
        photoVersion: Date.now(),
        photoError,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  const handleReset = () => {
    setResult(null);
    intakeMutation.reset();
  };

  const handlePrint = (barcode: string) => {
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>${t("intake.printWindowTitle", { barcode })}</title></head>
        <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;">
          <img src="/api/packages/barcode/${barcode}.png" style="max-width:90%;" />
          <p style="margin-top:8px;font-size:14px;">${barcode}</p>
          <script>
            document.querySelector('img').onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Success screen
  if (result) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle>{t("intake.success.title")}</CardTitle>
            <CardDescription>
              {t(
                result.notified
                  ? "intake.success.loggedAndNotified"
                  : "intake.success.logged",
                { recipientName: result.recipientName }
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border p-4 bg-muted/30">
              <img
                src={api.barcodeImageUrl(result.barcode)}
                alt={result.barcode}
                className="max-w-[280px]"
              />
              <Badge variant="outline" className="font-mono text-sm">
                {result.barcode}
              </Badge>
            </div>
            {result.photoPath && (
              <img
                src={api.packagePhotoUrl(result.id, result.photoVersion)}
                alt={t("intake.success.photoAlt", { barcode: result.barcode })}
                className="mx-auto max-h-64 max-w-full rounded-md object-contain"
              />
            )}
            {result.photoError && (
              <p className="text-sm text-destructive">{result.photoError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePrint(result.barcode)}
              >
                <Printer data-icon="inline-start" />
                {t("intake.actions.printLabel")}
              </Button>
              <Button className="flex-1" onClick={handleReset}>
                <PackagePlus data-icon="inline-start" />
                {t("intake.actions.nextPackage")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Intake form
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("intake.manual.title")}</h1>
        <p className="text-muted-foreground">
          {t("intake.manual.description")}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PackageDetailsForm
            onSubmit={(details) => intakeMutation.mutate(details)}
            isPending={intakeMutation.isPending}
            error={intakeMutation.isError ? intakeMutation.error.message : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
