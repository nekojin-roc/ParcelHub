import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageDetailsForm from "@/components/PackageDetailsForm";
import { PackagePlus, Printer, Check } from "lucide-react";

export default function ManualIntakePage() {
  const queryClient = useQueryClient();

  // Result state after successful intake
  const [result, setResult] = useState<{
    barcode: string;
    recipientName: string;
    notified: boolean;
  } | null>(null);

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
    setResult(null);
    intakeMutation.reset();
  };

  const handlePrint = (barcode: string) => {
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Label: ${barcode}</title></head>
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePrint(result.barcode)}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Label
              </Button>
              <Button className="flex-1" onClick={handleReset}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Next Package
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Intake form
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manual Intake</h1>
        <p className="text-muted-foreground">
          Register a new incoming package.
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
