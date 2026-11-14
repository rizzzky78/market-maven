"use client";

import { FC, useTransition } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssignmentView, ConnectionView } from "@/lib/agents/ai-settings-schema";
import { getPreset, PROVIDER_GROUP_LABELS } from "@/lib/agents/providers";
import { deleteConnection, fetchConnectionModels } from "@/lib/service/ai-settings/actions";
import { ConnectionDialog } from "./connection-dialog";

type ConnectionsSectionProps = {
  connections: ConnectionView[];
  assignments: AssignmentView[];
  modelCache: Record<string, string[]>;
  onModels: (connectionId: string, models: string[]) => void;
};

/** The user's provider connections: add, edit, test and remove. */
export const ConnectionsSection: FC<ConnectionsSectionProps> = ({
  connections,
  assignments,
  modelCache,
  onModels,
}) => (
  <section className="flex flex-col gap-6" aria-labelledby="connections-heading">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 id="connections-heading" className="text-lg font-semibold tracking-tight">
          Connections
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect official APIs or any OpenAI- or Anthropic-compatible endpoint,
          such as DeepSeek, Qwen, Kimi or GLM. Without a connection, Maven runs
          on its own Gemini models.
        </p>
      </div>
      <ConnectionDialog onModels={onModels}>
        <Button size="sm" className="rounded-full">
          <Plus className="size-4" aria-hidden />
          Add connection
        </Button>
      </ConnectionDialog>
    </header>

    {connections.length === 0 ? (
      <p className="border-y border-dashed py-10 text-center text-sm text-muted-foreground">
        No connections yet. Add one to choose your own models.
      </p>
    ) : (
      <ul className="divide-y border-y">
        {connections.map((connection) => (
          <ConnectionRow
            key={connection.id}
            connection={connection}
            usedBy={assignments.filter((a) => a.connectionId === connection.id).length}
            modelCount={modelCache[connection.id]?.length}
            onModels={onModels}
          />
        ))}
      </ul>
    )}
  </section>
);

const ConnectionRow: FC<{
  connection: ConnectionView;
  usedBy: number;
  modelCount?: number;
  onModels: (connectionId: string, models: string[]) => void;
}> = ({ connection, usedBy, modelCount, onModels }) => {
  const [testing, startTesting] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const preset = getPreset(connection.provider);

  const onTest = () =>
    startTesting(async () => {
      const result = await fetchConnectionModels({
        id: connection.id,
        provider: connection.provider,
        baseURL: connection.baseURL,
      });
      if (!result.ok) {
        toast.error(`${connection.label}: ${result.error}`);
        return;
      }
      onModels(connection.id, result.data);
      toast.success(`${connection.label} is working`, {
        description: `${result.data.length} models available`,
      });
    });

  const onDelete = () =>
    startDeleting(async () => {
      const result = await deleteConnection(connection.id);
      if (result.ok) toast.success("Connection removed");
      else toast.error(result.error);
    });

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{connection.label}</span>
          <Badge variant="secondary" className="rounded-full font-normal">
            {preset.label}
          </Badge>
          <Badge variant="outline" className="rounded-full font-normal">
            {PROVIDER_GROUP_LABELS[preset.group]}
          </Badge>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          Key {connection.apiKeyHint}
          {(connection.baseURL ?? preset.baseURL) && ` · ${connection.baseURL ?? preset.baseURL}`}
          {usedBy > 0 && ` · used by ${usedBy} ${usedBy === 1 ? "role" : "roles"}`}
          {modelCount !== undefined && ` · ${modelCount} models`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onTest} disabled={testing}>
          {testing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />}
          Test
        </Button>
        <ConnectionDialog connection={connection} onModels={onModels}>
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
        </ConnectionDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={deleting}
            >
              <Trash2 className="size-4" aria-hidden />
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-(family-name:--font-satoshi)">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {connection.label}?</AlertDialogTitle>
              <AlertDialogDescription>
                The stored key is deleted.
                {usedBy > 0 &&
                  ` ${usedBy} ${usedBy === 1 ? "role uses" : "roles use"} this connection and will go back to the default model.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
};
