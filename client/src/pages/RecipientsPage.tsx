import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api, type Recipient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, UserRound } from "lucide-react";

export default function RecipientsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: recipients, isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });

  const createMutation = useMutation({
    mutationFn: api.createRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      setDialogOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteRecipient,
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => {
      setDeleteError(err.message);
    },
  });

  const handleCreate = () => {
    if (!name || !email) return;
    createMutation.mutate({
      name,
      email,
      phone: phone || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("recipients.title")}</h1>
          <p className="text-muted-foreground">
            {t("recipients.description")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus data-icon="inline-start" />
          {t("recipients.add")}
        </Button>
      </div>

      {deleteError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {deleteError}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.status.loading")}</div>
      ) : !recipients?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("recipients.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipients.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <UserRound className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-sm text-muted-foreground">{r.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={
                      deleteMutation.isPending &&
                      deleteMutation.variables === r.id
                    }
                    onClick={() => {
                      setDeleteError(null);
                      if (confirm(t("recipients.confirmDelete", { name: r.name }))) {
                        deleteMutation.mutate(r.id);
                      }
                    }}
                  >
                    <span className="sr-only">{t("recipients.deleteLabel", { name: r.name })}</span>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {r.phone && (
                  <p className="mt-2 text-sm text-muted-foreground">{r.phone}</p>
                )}
                {r.notes && (
                  <p className="mt-1 text-sm text-muted-foreground italic">
                    {r.notes}
                  </p>
                )}
                {r._count && (
                  <div className="mt-3">
                    <Badge variant="secondary">
                      {t("recipients.packageCount", { count: r._count.packages })}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Recipient Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("recipients.dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("recipients.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("recipients.dialog.nameLabel")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("recipients.dialog.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("recipients.dialog.emailLabel")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("recipients.dialog.emailPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("recipients.dialog.phoneLabel")}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("recipients.dialog.phonePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("recipients.dialog.notesLabel")}</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("recipients.dialog.notesPlaceholder")}
              />
            </div>
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">
              {createMutation.error.message}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || !email || createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              {t("recipients.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
