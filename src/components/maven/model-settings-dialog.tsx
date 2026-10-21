"use client";

import { FC, FormEvent, ReactNode, useState } from "react";
import { ExternalLink, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModelSettings } from "@/components/hooks/use-model-settings";
import {
  modelConfigSchema,
  PROVIDERS,
  ProviderId,
  providerIds,
} from "@/lib/agents/providers";

const DEFAULT = "default";

type Draft = {
  provider: ProviderId | typeof DEFAULT;
  apiKey: string;
  model: string;
  lightModel: string;
  baseURL: string;
};

/** Label of the models in use, for the trigger's tooltip. */
export const useModelLabel = () => {
  const config = useModelSettings((s) => s.config);
  return config
    ? `${PROVIDERS[config.provider].label} · ${config.model}`
    : "Maven default (Gemini)";
};

/**
 * Lets the user run Maven on their own LLM provider and API key, or keep the
 * app's default models. Settings stay in this browser.
 */
export const ModelSettingsDialog: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config, setConfig } = useModelSettings();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => fromConfig(config));

  const preset = draft.provider === DEFAULT ? null : PROVIDERS[draft.provider];

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  };

  const onOpenChange = (next: boolean) => {
    if (next) {
      setDraft(fromConfig(config));
      setError(null);
    }
    setOpen(next);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (draft.provider === DEFAULT) {
      setConfig(null);
      toast.success("Using Maven's default models");
      setOpen(false);
      return;
    }

    const parsed = modelConfigSchema.safeParse({
      provider: draft.provider,
      apiKey: draft.apiKey,
      model: draft.model,
      lightModel: draft.lightModel,
      baseURL: draft.provider === "custom" ? draft.baseURL : undefined,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(
        issue.path[0] === "baseURL"
          ? issue.message
          : `Check the ${String(issue.path[0] ?? "settings")} field.`
      );
      return;
    }

    setConfig(parsed.data);
    toast.success(`Using ${PROVIDERS[parsed.data.provider].label}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg font-(family-name:--font-satoshi)">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>AI provider</DialogTitle>
            <DialogDescription>
              Run Maven on your own LLM provider and API key, or keep the
              default models. Your key stays in this browser and is only sent
              with your chat requests; Maven never stores it.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="model-provider">Provider</Label>
            <Select
              value={draft.provider}
              onValueChange={(value) =>
                update({ provider: value as Draft["provider"] })
              }
            >
              <SelectTrigger id="model-provider" data-testid="provider-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT}>Maven default (Gemini)</SelectItem>
                {providerIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {PROVIDERS[id].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {preset && (
            <>
              {draft.provider === "custom" && (
                <Field
                  id="model-base-url"
                  label="Base URL"
                  hint="An OpenAI-compatible API over HTTPS, such as https://api.example.com/v1"
                >
                  <Input
                    id="model-base-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://api.example.com/v1"
                    value={draft.baseURL}
                    onChange={(e) => update({ baseURL: e.target.value })}
                    required
                  />
                </Field>
              )}

              <Field
                id="model-api-key"
                label="API key"
                hint={
                  preset.keyUrl && (
                    <a
                      href={preset.keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                    >
                      Get a {preset.label} key
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )
                }
              >
                <Input
                  id="model-api-key"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={draft.apiKey}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  required
                />
              </Field>

              <Field
                id="model-id"
                label="Model"
                hint="Used for routing, research and answers. It must support tool calling."
              >
                <Input
                  id="model-id"
                  placeholder={preset.exampleModel}
                  spellCheck={false}
                  value={draft.model}
                  onChange={(e) => update({ model: e.target.value })}
                  required
                />
              </Field>

              <Field
                id="model-light-id"
                label="Light model (optional)"
                hint="A faster model for follow-up suggestions and chat titles. Defaults to the model above."
              >
                <Input
                  id="model-light-id"
                  placeholder={preset.exampleLightModel}
                  spellCheck={false}
                  value={draft.lightModel}
                  onChange={(e) => update({ lightModel: e.target.value })}
                />
              </Field>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="submit" data-testid="save-model-settings">
              <KeyRound className="size-4" aria-hidden />
              {preset ? "Save provider" : "Use default"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field: FC<{
  id: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}> = ({ id, label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const fromConfig = (
  config: ReturnType<typeof useModelSettings.getState>["config"]
): Draft => ({
  provider: config?.provider ?? DEFAULT,
  apiKey: config?.apiKey ?? "",
  model: config?.model ?? "",
  lightModel: config?.lightModel ?? "",
  baseURL: config?.baseURL ?? "",
});
