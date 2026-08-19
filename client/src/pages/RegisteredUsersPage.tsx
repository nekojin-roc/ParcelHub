import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, LoaderCircle, TicketPlus, UserRound } from "lucide-react";
import {
  api,
  type Recipient,
  type ReferralCode,
  type RegisteredUser,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNASSIGNED = "__unassigned__";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function ReferralCodesCard({
  codes,
  isLoading,
  isGenerating,
  onGenerate,
}: {
  codes: ReferralCode[];
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Referral codes</CardTitle>
            <CardDescription>
              Generate a single-use code for a new account. Used codes leave
              this list automatically.
            </CardDescription>
          </div>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <TicketPlus data-icon="inline-start" />
            )}
            Generate code
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading active referral codes...
          </p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active referral codes.
          </p>
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <code className="font-mono text-sm font-semibold">
                    {code.code}
                  </code>
                  <Badge variant="outline">Active</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Generated {formatDate(code.createdAt)} by {code.createdBy.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RegisteredUserCard({
  user,
  recipients,
  unavailableRecipientIds,
  isSaving,
  onSave,
}: {
  user: RegisteredUser;
  recipients: Recipient[];
  unavailableRecipientIds: Set<string>;
  isSaving: boolean;
  onSave: (recipientId: string | null) => void;
}) {
  const savedRecipientId = user.recipient?.id ?? null;
  const [recipientId, setRecipientId] = useState(savedRecipientId);

  useEffect(() => {
    setRecipientId(savedRecipientId);
  }, [savedRecipientId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <UserRound className="size-5 text-secondary-foreground" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle className="truncate text-base">{user.name}</CardTitle>
              <CardDescription className="truncate">{user.email}</CardDescription>
            </div>
          </div>
          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
            {user.role === "ADMIN" ? "Admin" : "User"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {user.emailVerified ? "Email verified" : "Email not verified"}
          </Badge>
          <span className="text-muted-foreground">
            Registered {formatDate(user.createdAt)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Linked recipient</span>
          <span className="font-medium">
            {user.recipient?.name ?? "Not linked"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row">
        <Select
          value={recipientId ?? UNASSIGNED}
          onValueChange={(value) =>
            setRecipientId(value === UNASSIGNED ? null : value)
          }
          disabled={isSaving}
        >
          <SelectTrigger aria-label={`Recipient linked to ${user.name}`}>
            <SelectValue placeholder="Select a recipient" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={UNASSIGNED}>Not linked</SelectItem>
              {recipients.map((recipient) => (
                <SelectItem
                  key={recipient.id}
                  value={recipient.id}
                  disabled={
                    recipient.id !== savedRecipientId &&
                    unavailableRecipientIds.has(recipient.id)
                  }
                >
                  {recipient.name} ({recipient.email})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={() => onSave(recipientId)}
          disabled={isSaving || recipientId === savedRecipientId}
        >
          {isSaving ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Link2 data-icon="inline-start" />
          )}
          Save link
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function RegisteredUsersPage() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["registered-users"],
    queryFn: api.listRegisteredUsers,
  });
  const recipientsQuery = useQuery({
    queryKey: ["recipients"],
    queryFn: api.listRecipients,
  });
  const referralCodesQuery = useQuery({
    queryKey: ["referral-codes"],
    queryFn: api.listReferralCodes,
    refetchInterval: 10_000,
  });

  const referralCodeMutation = useMutation({
    mutationFn: api.createReferralCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
    },
  });

  const linkMutation = useMutation({
    mutationFn: ({
      userId,
      recipientId,
    }: {
      userId: string;
      recipientId: string | null;
    }) => api.updateRegisteredUserRecipient(userId, recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registered-users"] });
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
    },
  });

  const users = usersQuery.data ?? [];
  const recipients = recipientsQuery.data ?? [];
  const assignedRecipientIds = useMemo(
    () =>
      new Set(
        users.flatMap((user) => (user.recipient ? [user.recipient.id] : []))
      ),
    [users]
  );
  const error =
    usersQuery.error ??
    recipientsQuery.error ??
    referralCodesQuery.error ??
    linkMutation.error ??
    referralCodeMutation.error;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registered Users</h1>
        <p className="text-muted-foreground">
          View account access and connect each account to a recipient profile.
        </p>
      </div>

      <ReferralCodesCard
        codes={referralCodesQuery.data ?? []}
        isLoading={referralCodesQuery.isLoading}
        isGenerating={referralCodeMutation.isPending}
        onGenerate={() => referralCodeMutation.mutate()}
      />

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load or update registered users</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {usersQuery.isLoading || recipientsQuery.isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading registered users</CardTitle>
            <CardDescription>
              Retrieving accounts and recipient profiles...
            </CardDescription>
          </CardHeader>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No registered users</CardTitle>
            <CardDescription>
              Accounts will appear here after they complete registration.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {users.map((user) => (
            <RegisteredUserCard
              key={user.id}
              user={user}
              recipients={recipients}
              unavailableRecipientIds={assignedRecipientIds}
              isSaving={
                linkMutation.isPending &&
                linkMutation.variables?.userId === user.id
              }
              onSave={(recipientId) =>
                linkMutation.mutate({ userId: user.id, recipientId })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
