import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageDetailsForm from "@/components/PackageDetailsForm";
import { PackagePlus, Check, Loader2, FileDown, Printer } from "lucide-react";

// Label-first intake: print the label before anything else, stick it on the
// parcel, then fill in the details. The package record is only created when
// the details form is submitted.
export default function LabelFirstIntakePage() {
  const queryClient = useQueryClient();

  const [label, setLabel] = useState<{
    barcode: string;
    printed: boolean;
  } | null>(null);

  const [result, setResult] = useState<{
    barcode: string;
    recipientName: string;
    notified: boolean;
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
    mutationFn: api.intake,
    onSuccess: (pkg) => {
      setResult({
        barcode: pkg.barcode,
        recipientName: pkg.recipient?.name ?? "Unknown",
        notified: pkg.status === "NOTIFIED",
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
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle>Package Registered</CardTitle>
            <CardDescription>
              Package for {result.recipientName} has been logged
              {result.notified ? " and notified" : ""}.
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
            <Button className="w-full" onClick={handleReset}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Next Package
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: label printed/downloaded — fill in package details
  if (label) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Package Details</h1>
          <p className="text-muted-foreground">
            {label.printed
              ? "Label sent to printer. Stick it on the parcel, then fill in the details."
              : "Label downloaded as PDF. Print and stick it on the parcel, then fill in the details."}
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
                  PDF
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
              submitLabel="Complete Intake"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: print the label
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Label-First Intake</h1>
        <p className="text-muted-foreground">
          Print a barcode label first, stick it on the parcel, then fill in the
          details.
        </p>
      </div>

      <Button
        className="w-full h-24 text-lg font-semibold [&_svg]:size-6"
        disabled={labelMutation.isPending}
        onClick={() => labelMutation.mutate()}
      >
        {labelMutation.isPending ? (
          <Loader2 className="mr-2 animate-spin" />
        ) : (
          <Printer className="mr-2" />
        )}
        Print Label
      </Button>

      {labelMutation.isError && (
        <p className="text-sm text-destructive">
          {labelMutation.error.message}
        </p>
      )}
    </div>
  );
}
