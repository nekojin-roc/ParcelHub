import { useState, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
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

function photoValidationError(photo: File): string | null {
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(photo.type)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }
  if (photo.size > MAX_PHOTO_BYTES) return "Photo must be 5 MB or smaller.";
  return null;
}

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
  submitLabel = "Register Package",
}: PackageDetailsFormProps) {
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
    ? "Unable to check recipients. Refresh the page and try again."
    : noRecipients
      ? "Add a recipient on the Recipients page before adding a package."
      : undefined;

  const { data: bins } = useQuery({
    queryKey: ["bins"],
    queryFn: api.listBins,
  });

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

    const validationError = photoValidationError(selectedPhoto);
    setPhoto(validationError ? null : selectedPhoto);
    setPhotoError(validationError);
  };

  return (
    <div className="space-y-4">
      {/* Recipient */}
      <div className="space-y-2">
        <Label>Recipient *</Label>
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
            <SelectValue placeholder="Select recipient..." />
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
        <Label>Description</Label>
        <Input
          placeholder="e.g. Anime figure, Electronics..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Order Number */}
      <div className="space-y-2">
        <Label>Order Number</Label>
        <Input
          placeholder="e.g. ORD-12345"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
      </div>

      {/* Tracking Number */}
      <div className="space-y-2">
        <Label>Carrier Tracking Number</Label>
        <Input
          placeholder="e.g. 1Z999AA10123456784"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
      </div>

      {/* Photo */}
      <div className="space-y-2">
        <Label htmlFor="package-photo">Package Photo</Label>
        <Input
          id="package-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
        <p className="text-xs text-muted-foreground">
          Optional. JPEG, PNG, or WebP up to 5 MB.
        </p>
        {photo && (
          <p className="text-xs text-muted-foreground">
            Selected: {photo.name}
          </p>
        )}
        {photoError && <p className="text-sm text-destructive">{photoError}</p>}
      </div>

      {/* Bin */}
      <div className="space-y-2">
        <Label>Storage Bin</Label>
        <Select value={binId} onValueChange={setBinId}>
          <SelectTrigger>
            <SelectValue placeholder="Select bin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {bins?.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.label}
                  {b.description ? ` — ${b.description}` : ""}
                  {b.currentCount !== undefined
                    ? ` (${b.currentCount}/${b.capacity})`
                    : ""}
                </SelectItem>
              ))}
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
          Send email notification to recipient
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
          {submitLabel}
        </Button>
      </RecipientRequiredTooltip>
    </div>
  );
}
