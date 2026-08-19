import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import RecipientRequiredTooltip from "@/components/RecipientRequiredTooltip";
import { PackagePlus, PencilLine } from "lucide-react";

export default function IntakePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const recipientsQuery = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });
  const hasRecipients = (recipientsQuery.data?.length ?? 0) > 0;
  const intakeUnavailable = recipientsQuery.isLoading || recipientsQuery.isError;
  const unavailableMessage = recipientsQuery.isError
    ? t("intake.errors.checkRecipients")
    : !recipientsQuery.isLoading && !hasRecipients
      ? t("intake.errors.recipientRequiredForIntake")
      : undefined;

  const openIntake = (path: string) => {
    navigate(hasRecipients ? path : "/recipients");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("intake.title")}</h1>
        <p className="text-muted-foreground">
          {t("intake.description")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <RecipientRequiredTooltip message={unavailableMessage}>
          <Button
            className="h-24 w-full text-lg font-semibold [&_svg]:size-6"
            disabled={intakeUnavailable}
            onClick={() => openIntake("/intake/label")}
          >
            <PackagePlus data-icon="inline-start" />
            {t("intake.actions.start")}
          </Button>
        </RecipientRequiredTooltip>
        <RecipientRequiredTooltip message={unavailableMessage}>
          <Button
            variant="outline"
            className="h-12 w-full"
            disabled={intakeUnavailable}
            onClick={() => openIntake("/intake/manual")}
          >
            <PencilLine data-icon="inline-start" />
            {t("intake.actions.manual")}
          </Button>
        </RecipientRequiredTooltip>
      </div>
    </div>
  );
}
