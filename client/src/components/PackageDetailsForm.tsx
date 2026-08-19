import { useEffect, useState, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RecipientRequiredTooltip from "@/components/RecipientRequiredTooltip";
import { PackagePlus, Loader2 } from "lucide-react";

export interface PackageDetails {
  recipientId: string;
  description?: string;
  orderNumber?: string;
  trackingNumber?: string;
  binId?: string;
  notify: boolean;
  photo?: File;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

interface PackageDetailsFormProps {
  onSubmit: (details: PackageDetails) => void;
  isPending: boolean;
  error?: string | null;
  submitLabel?: string;
}

export default function PackageDetailsForm({
  onSubmit,
  isPending,
  error,
  submitLabel,
}: PackageDetailsFormProps) {
  const { t } = useTranslation();
  const [recipientId, setRecipientId] = useState("");
  const [description, setDescription] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [binId, setBinId] = useState("");
  const [notify, setNotify] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const recipientsQuery = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });
  const recipients = recipientsQuery.data ?? [];
  const noRecipients =
    !recipientsQuery.isLoading &&
    !recipientsQuery.isError &&
    recipients.length === 0;
  const recipientUnavailableMessage = recipientsQuery.isError
    ? t("intake.errors.checkRecipients")
    : noRecipients
      ? t("intake.errors.recipientRequiredForPackage")
      : undefined;

  const { data: bins } = useQuery({
    queryKey: ["bins"],
    queryFn: api.listBins,
  });

  useEffect(() => {
    if (binId || !bins) return;
    const defaultBin = bins.find((bin) => bin.isDefault);
    if (defaultBin) setBinId(defaultBin.id);
  }, [binId, bins]);

  const handleSubmit = () => {
    if (!recipientId) return;
    onSubmit({
      recipientId,
      description: description || undefined,
      orderNumber: orderNumber || undefined,
      trackingNumber: trackingNumber || undefined,
      binId: binId || undefined,
      notify,
      photo: photo ?? undefined,
    });
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhoto = event.target.files?.[0] ?? null;
    if (!selectedPhoto) {
      setPhoto(null);
      setPhotoError(null);
      return;
    }

    const validationError = !new Set(["image/jpeg", "image/png", "image/webp"]).has(
      selectedPhoto.type
    )
      ? t("intake.errors.photoType")
      : selectedPhoto.size > MAX_PHOTO_BYTES
        ? t("intake.errors.photoSize")
        : null;
    setPhoto(validationError ? null : selectedPhoto);
    setPhotoError(validationError);
  };

  return (
    <div className="space-y-4">
      {/* Recipient */}
      <div className="space-y-2">
        <Label>{t("intake.form.recipient.label")}</Label>
        <Select
          value={recipientId}
          onValueChange={setRecipientId}
          disabled={
            recipientsQuery.isLoading ||
            recipientsQuery.isError ||
            noRecipients
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("intake.form.recipient.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {recipients.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>{t("intake.form.description.label")}</Label>
        <Input
          placeholder={t("intake.form.description.placeholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Order Number */}
      <div className="space-y-2">
        <Label>{t("intake.form.orderNumber.label")}</Label>
        <Input
          placeholder={t("intake.form.orderNumber.placeholder")}
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
      </div>

      {/* Tracking Number */}
      <div className="space-y-2">
        <Label>{t("intake.form.trackingNumber.label")}</Label>
        <Input
          placeholder={t("intake.form.trackingNumber.placeholder")}
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
      </div>

      {/* Photo */}
      <div className="space-y-2">
        <Label htmlFor="package-photo">{t("intake.form.photo.label")}</Label>
        <Input
          id="package-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
        <p className="text-xs text-muted-foreground">
          {t("intake.form.photo.helper")}
        </p>
        {photo && (
          <p className="text-xs text-muted-foreground">
            {t("intake.form.photo.selected", { fileName: photo.name })}
          </p>
        )}
        {photoError && <p className="text-sm text-destructive">{photoError}</p>}
      </div>

      {/* Bin */}
      <div className="space-y-2">
        <Label>{t("intake.form.bin.label")}</Label>
        <Select value={binId} onValueChange={setBinId}>
          <SelectTrigger>
            <SelectValue placeholder={t("intake.form.bin.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {bins?.map((b) => {
                const label = b.isDefault
                  ? t("common.storageBins.uncategorized.label")
                  : b.label;
                const binDescription = b.isDefault
                  ? t("common.storageBins.uncategorized.description")
                  : b.description;

                return (
                  <SelectItem key={b.id} value={b.id}>
                    {label}
                    {binDescription ? ` — ${binDescription}` : ""}
                    {b.currentCount !== undefined
                      ? ` (${b.currentCount}/${b.capacity})`
                      : ""}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Notify toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="notify"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="notify" className="cursor-pointer">
          {t("intake.form.notify")}
        </Label>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <RecipientRequiredTooltip message={recipientUnavailableMessage}>
        <Button
          className="w-full"
          size="lg"
          disabled={
            !recipientId ||
            isPending ||
            recipientsQuery.isLoading ||
            recipientsQuery.isError ||
            noRecipients
          }
          onClick={handleSubmit}
        >
          {isPending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <PackagePlus data-icon="inline-start" />
          )}
          {submitLabel ?? t("intake.form.submit")}
        </Button>
      </RecipientRequiredTooltip>
    </div>
  );
}
