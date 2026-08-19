import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import RecipientRequiredTooltip from "@/components/RecipientRequiredTooltip";
import { PackagePlus, PencilLine } from "lucide-react";

export default function IntakePage() {
  const navigate = useNavigate();
  const recipientsQuery = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });
  const hasRecipients = (recipientsQuery.data?.length ?? 0) > 0;
  const intakeUnavailable =
    recipientsQuery.isLoading || recipientsQuery.isError || !hasRecipients;
  const unavailableMessage = recipientsQuery.isError
    ? "Unable to check recipients. Refresh the page and try again."
    : !recipientsQuery.isLoading && !hasRecipients
      ? "Add a recipient on the Recipients page before starting intake."
      : undefined;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Package Intake</h1>
        <p className="text-muted-foreground">
          Choose how to register incoming packages.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <RecipientRequiredTooltip message={unavailableMessage}>
          <Button
            className="h-24 w-full text-lg font-semibold [&_svg]:size-6"
            disabled={intakeUnavailable}
            onClick={() => navigate("/intake/label")}
          >
            <PackagePlus data-icon="inline-start" />
            Intake
          </Button>
        </RecipientRequiredTooltip>
        <RecipientRequiredTooltip message={unavailableMessage}>
          <Button
            variant="outline"
            className="h-12 w-full"
            disabled={intakeUnavailable}
            onClick={() => navigate("/intake/manual")}
          >
            <PencilLine data-icon="inline-start" />
            Manual Intake
          </Button>
        </RecipientRequiredTooltip>
      </div>
    </div>
  );
}
