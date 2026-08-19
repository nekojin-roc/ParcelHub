import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageDetailsForm, {
  type PackageDetails,
} from "@/components/PackageDetailsForm";
import RecipientRequiredTooltip from "@/components/RecipientRequiredTooltip";
import { PackagePlus, Check, Loader2, FileDown, Printer } from "lucide-react";

type LabelIntakeDetails = PackageDetails & { barcode: string };

// Label-first intake: print the label before anything else, stick it on the
// parcel, then fill in the details. The package record is only created when
// the details form is submitted.
export default function LabelFirstIntakePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const recipientsQuery = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });
  const hasRecipients = (recipientsQuery.data?.length ?? 0) > 0;
  const labelUnavailable =
    recipientsQuery.isLoading || recipientsQuery.isError || !hasRecipients;
  const unavailableMessage = recipientsQuery.isError
    ? t("intake.errors.checkRecipients")
    : !recipientsQuery.isLoading && !hasRecipients
      ? t("intake.errors.recipientRequiredForLabel")
      : undefined;

  const [label, setLabel] = useState<{
    barcode: string;
    printed: boolean;
  } | null>(null);

  const [result, setResult] = useState<{
    id: string;
    barcode: string;
    recipientName: string;
    notified: boolean;
    photoPath?: string | null;
    photoVersion: number;
    photoError?: string;
  } | null>(null);

  const labelMutation = useMutation({
    mutationFn: api.createLabel,
    onSuccess: (created) => {
      if (!created.printed) {
        // No label printer connected — download the label as a PDF instead
        const a = document.createElement("a");
        a.href = api.labelPdfUrl(created.barcode);
        a.download = `${created.barcode}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setLabel(created);
    },
  });

  const intakeMutation = useMutation({
    mutationFn: async ({ photo, ...details }: LabelIntakeDetails) => {
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
    setLabel(null);
    setResult(null);
    labelMutation.reset();
    intakeMutation.reset();
  };

  // Step 3: done
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
            <Button className="w-full" onClick={handleReset}>
              <PackagePlus data-icon="inline-start" />
              {t("intake.actions.nextPackage")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: label printed/downloaded — fill in package details
  if (label) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("intake.labelFirst.packageDetailsTitle")}</h1>
          <p className="text-muted-foreground">
            {label.printed
              ? t("intake.labelFirst.printedDescription")
              : t("intake.labelFirst.downloadedDescription")}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border p-4 bg-muted/30">
              <img
                src={api.barcodeImageUrl(label.barcode)}
                alt={label.barcode}
                className="max-w-[280px]"
              />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-sm">
                  {label.barcode}
                </Badge>
                <a
                  href={api.labelPdfUrl(label.barcode)}
                  download={`${label.barcode}.pdf`}
                  className="text-sm text-muted-foreground underline inline-flex items-center gap-1"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {t("intake.labelFirst.pdf")}
                </a>
              </div>
            </div>

            <PackageDetailsForm
              onSubmit={(details) =>
                intakeMutation.mutate({ ...details, barcode: label.barcode })
              }
              isPending={intakeMutation.isPending}
              error={
                intakeMutation.isError ? intakeMutation.error.message : null
              }
              submitLabel={t("intake.actions.complete")}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: print the label
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("intake.labelFirst.title")}</h1>
        <p className="text-muted-foreground">
          {t("intake.labelFirst.description")}
        </p>
      </div>

      <RecipientRequiredTooltip message={unavailableMessage}>
        <Button
          className="h-24 w-full text-lg font-semibold [&_svg]:size-6"
          disabled={labelMutation.isPending || labelUnavailable}
          onClick={() => labelMutation.mutate()}
        >
          {labelMutation.isPending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Printer data-icon="inline-start" />
          )}
          {t("intake.actions.printLabel")}
        </Button>
      </RecipientRequiredTooltip>

      {labelMutation.isError && (
        <p className="text-sm text-destructive">
          {labelMutation.error.message}
        </p>
      )}
    </div>
  );
}
