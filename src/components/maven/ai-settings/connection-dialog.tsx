"use client";

import { FC, FormEvent, ReactNode, useState, useTransition } from "react";
import { ExternalLink, Loader2, PlugZap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConnectionView } from "@/lib/agents/ai-settings-schema";
import {
  getPreset,
  needsBaseURL,
  PROVIDER_GROUP_LABELS,
  type ProviderGroup,
  type ProviderId,
  providerIds,
} from "@/lib/agents/providers";
import { fetchConnectionModels, saveConnection } from "@/lib/service/ai-settings/actions";

type Draft = {
  label: string;
  provider: ProviderId;
  apiKey: string;
  baseURL: string;
  structuredOutputs: boolean;
};

const GROUPS = Object.keys(PROVIDER_GROUP_LABELS) as ProviderGroup[];

const toDraft = (connection?: ConnectionView): Draft => {
  const provider = connection?.provider ?? "openrouter";
  return {
    label: connection?.label ?? "",
    provider,
    apiKey: "",
    baseURL: connection?.baseURL ?? "",
    structuredOutputs:
      connection?.structuredOutputs ?? getPreset(provider).structuredOutputs ?? true,
  };
};

type ConnectionDialogProps = {
  /** Edits this connection; adds a new one when absent */
  connection?: ConnectionView;
  /** Receives the models listed by a successful test */
  onModels: (connectionId: string, models: string[]) => void;
  children: ReactNode;
};

/**
 * Adds or edits a provider connection. The key is sent to the server once and
 * stored encrypted; on edit, leaving it empty keeps the stored key. "Test"
 * lists the provider's models, which verifies the key and base URL.
 */
export const ConnectionDialog: FC<ConnectionDialogProps> = ({
  connection,
  onModels,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(connection));
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState<string[] | null>(null);
  const [saving, startSaving] = useTransition();
  const [testing, startTesting] = useTransition();

  const preset = getPreset(draft.provider);
  const custom = needsBaseURL(draft.provider);
  const isEdit = !!connection;

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
    setTested(null);
  };

  const onOpenChange = (next: boolean) => {
    if (next) {
      setDraft(toDraft(connection));
      setError(null);
      setTested(null);
    }
    setOpen(next);
  };

  const onProviderChange = (provider: ProviderId) => {
    const next = getPreset(provider);
    update({
      provider,
      structuredOutputs: next.structuredOutputs ?? true,
      label:
        !draft.label || draft.label === getPreset(draft.provider).label
          ? next.label
          : draft.label,
    });
  };

  const onTest = () => {
    startTesting(async () => {
      const result = await fetchConnectionModels({
        id: connection?.id,
        provider: draft.provider,
        apiKey: draft.apiKey || undefined,
        baseURL: custom ? draft.baseURL : null,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTested(result.data);
      if (connection) onModels(connection.id, result.data);
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const result = await saveConnection({
        id: connection?.id,
        label: draft.label || preset.label,
        provider: draft.provider,
        apiKey: draft.apiKey || undefined,
        baseURL: custom ? draft.baseURL : null,
        structuredOutputs:
          preset.kind === "openai-compatible" ? draft.structuredOutputs : null,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (tested) onModels(result.data.id, tested);
      toast.success(isEdit ? "Connection updated" : "Connection added");
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg font-(family-name:--font-satoshi)">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit connection" : "Add connection"}</DialogTitle>
            <DialogDescription>
              Your key is encrypted before it is stored and is only used for
              your own requests. Maven never shows it again.
            </DialogDescription>
          </DialogHeader>

          <Field id="connection-provider" label="Provider">
            <Select
              value={draft.provider}
              onValueChange={(value) => onProviderChange(value as ProviderId)}
            >
              <SelectTrigger id="connection-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUPS.map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{PROVIDER_GROUP_LABELS[group]}</SelectLabel>
                    {providerIds
                      .filter((id) => getPreset(id).group === group)
                      .map((id) => (
                        <SelectItem key={id} value={id}>
                          {getPreset(id).label}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="connection-label" label="Name" hint="Shown when you pick a model for a tool.">
            <Input
              id="connection-label"
              maxLength={60}
              placeholder={preset.label}
              value={draft.label}
              onChange={(e) => update({ label: e.target.value })}
            />
          </Field>

          {custom && (
            <Field
              id="connection-base-url"
              label="Base URL"
              hint={
                preset.kind === "anthropic-compatible"
                  ? "An Anthropic Messages API over HTTPS, including the version, such as https://api.example.com/anthropic/v1"
                  : "An OpenAI-compatible API over HTTPS, such as https://api.example.com/v1"
              }
            >
              <Input
                id="connection-base-url"
                type="url"
                inputMode="url"
                placeholder="https://api.example.com/v1"
                value={draft.baseURL}
                onChange={(e) => update({ baseURL: e.target.value })}
                required
              />
            </Field>
          )}

          {!custom && preset.baseURL && (
            <p className="text-xs text-muted-foreground break-all">
              Endpoint: {preset.baseURL}
            </p>
          )}

          <Field
            id="connection-api-key"
            label="API key"
            hint={
              <>
                {isEdit && <span>Stored key {connection.apiKeyHint}. Leave empty to keep it. </span>}
                {preset.keyUrl && (
                  <a
                    href={preset.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                  >
                    Get a {preset.label} key
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </>
            }
          >
            <Input
              id="connection-api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              required={!isEdit}
            />
          </Field>

          {preset.kind === "openai-compatible" && (
            <label className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={draft.structuredOutputs}
                onCheckedChange={(checked) => update({ structuredOutputs: checked === true })}
                className="mt-0.5"
              />
              <span>
                Supports JSON schema outputs
                <span className="block text-xs text-muted-foreground">
                  Turn off for APIs that only offer JSON mode (Maven then asks
                  for plain JSON and validates it).
                </span>
              </span>
            </label>
          )}

          {tested && (
            <p className="text-sm text-muted-foreground" role="status">
              Connected. {tested.length > 0 ? `${tested.length} models available.` : "The provider listed no models; type the model id yourself."}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onTest}
              disabled={testing || saving || (!draft.apiKey && !isEdit)}
            >
              {testing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <PlugZap className="size-4" aria-hidden />}
              Test
            </Button>
            <Button type="submit" disabled={saving || testing}>
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {isEdit ? "Save changes" : "Add connection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const Field: FC<{
  id: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}> = ({ id, label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
  </div>
);
