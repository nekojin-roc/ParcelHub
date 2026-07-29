import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackagePlus, Loader2 } from "lucide-react";

export interface PackageDetails {
  recipientId: string;
  description?: string;
  orderNumber?: string;
  trackingNumber?: string;
  binId?: string;
  notify: boolean;
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

  const { data: recipients } = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });

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
    });
  };

  return (
    <div className="space-y-4">
      {/* Recipient */}
      <div className="space-y-2">
        <Label>Recipient *</Label>
        <Select value={recipientId} onValueChange={setRecipientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select recipient..." />
          </SelectTrigger>
          <SelectContent>
            {recipients?.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
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

      {/* Bin */}
      <div className="space-y-2">
        <Label>Storage Bin</Label>
        <Select value={binId} onValueChange={setBinId}>
          <SelectTrigger>
            <SelectValue placeholder="Select bin..." />
          </SelectTrigger>
          <SelectContent>
            {bins?.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.label}
                {b.description ? ` — ${b.description}` : ""}
                {b.currentCount !== undefined
                  ? ` (${b.currentCount}/${b.capacity})`
                  : ""}
              </SelectItem>
            ))}
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
      <Button
        className="w-full"
        size="lg"
        disabled={!recipientId || isPending}
        onClick={handleSubmit}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PackagePlus className="mr-2 h-4 w-4" />
        )}
        {submitLabel}
      </Button>
    </div>
  );
}
