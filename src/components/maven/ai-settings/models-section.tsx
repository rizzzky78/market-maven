"use client";

import { FC, FormEvent, useId, useState, useTransition } from "react";
import { ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  type AssignmentView,
  type ConnectionView,
  MODEL_ROLE_INFO,
  MODEL_ROLES,
  type ModelRole,
  type ReasoningLevel,
  REASONING_LEVELS,
} from "@/lib/agents/ai-settings-schema";
import { getPreset } from "@/lib/agents/providers";
import { clearAssignment, saveAssignment } from "@/lib/service/ai-settings/actions";
import { cn } from "@/lib/utils";
import { Field } from "./connection-dialog";

const NONE = "none";

const REASONING_LABELS: Record<ReasoningLevel, string> = {
  "provider-default": "Provider default",
  none: "Off",
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra high",
  max: "Maximum",
};

type ModelsSectionProps = {
  connections: ConnectionView[];
  assignments: AssignmentView[];
  modelCache: Record<string, string[]>;
};

/** Connection, model and generation parameters per pipeline role. */
export const ModelsSection: FC<ModelsSectionProps> = ({
  connections,
  assignments,
  modelCache,
}) => {
  const byRole = new Map(assignments.map((a) => [a.role, a]));
  const fallbackLabel = byRole.has("default") ? "Uses Default" : "Maven default (Gemini)";

  return (
    <section className="flex flex-col gap-6" aria-labelledby="models-heading">
      <header className="max-w-2xl">
        <h2 id="models-heading" className="text-lg font-semibold tracking-tight">
          Models
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the model each part of Maven runs on. Tools without their own
          model use Default. Models must support tool calling and structured
          output; reasoning models fit research-heavy tools best.
        </p>
      </header>

      {connections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a connection first to assign models.
        </p>
      )}

      <ul className="divide-y border-y">
        {MODEL_ROLES.map((role) => (
          <RoleRow
            key={`${role}:${JSON.stringify(byRole.get(role) ?? null)}`}
            role={role}
            assignment={byRole.get(role)}
            connections={connections}
            modelCache={modelCache}
            fallbackLabel={role === "default" ? "Maven default (Gemini)" : fallbackLabel}
          />
        ))}
      </ul>
    </section>
  );
};

type Draft = {
  connectionId: string;
  model: string;
  temperature: number | null;
  maxOutputTokens: string;
  reasoning: ReasoningLevel;
};

const toDraft = (assignment?: AssignmentView): Draft => ({
  connectionId: assignment?.connectionId ?? NONE,
  model: assignment?.model ?? "",
  temperature: assignment?.temperature ?? null,
  maxOutputTokens: assignment?.maxOutputTokens?.toString() ?? "",
  reasoning: assignment?.reasoning ?? "provider-default",
});

const RoleRow: FC<{
  role: ModelRole;
  assignment?: AssignmentView;
  connections: ConnectionView[];
  modelCache: Record<string, string[]>;
  fallbackLabel: string;
}> = ({ role, assignment, connections, modelCache, fallbackLabel }) => {
  const info = MODEL_ROLE_INFO[role];
  const listId = useId();
  const [draft, setDraft] = useState<Draft>(() => toDraft(assignment));
  const [advanced, setAdvanced] = useState(
    () => assignment?.temperature != null || assignment?.maxOutputTokens != null || !!assignment?.reasoning
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const connection = connections.find((c) => c.id === draft.connectionId);
  const preset = connection ? getPreset(connection.provider) : null;
  const suggestions = connection ? (modelCache[connection.id] ?? []) : [];
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(assignment));

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (draft.connectionId === NONE) {
        const result = await clearAssignment(role);
        if (!result.ok) setError(result.error);
        else toast.success(`${info.label} now ${fallbackLabel.toLowerCase()}`);
        return;
      }

      const maxOutputTokens = draft.maxOutputTokens ? Number(draft.maxOutputTokens) : null;
      const result = await saveAssignment({
        role,
        connectionId: draft.connectionId,
        model: draft.model,
        temperature: draft.temperature,
        maxOutputTokens,
        reasoning: draft.reasoning === "provider-default" ? null : draft.reasoning,
      });

      if (!result.ok) setError(result.error);
      else toast.success(`${info.label} model saved`);
    });
  };

  return (
    <li className="py-5">
      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-10">
        <div>
          <h3 className="font-medium">{info.label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{info.description}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id={`${listId}-connection`} label="Connection">
              <Select
                value={draft.connectionId}
                onValueChange={(connectionId) => update({ connectionId })}
                disabled={connections.length === 0}
              >
                <SelectTrigger id={`${listId}-connection`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{fallbackLabel}</SelectItem>
                  {connections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {connection && (
              <Field
                id={`${listId}-model`}
                label="Model"
                hint={suggestions.length === 0 ? "Test the connection to list its models, or type an id." : undefined}
              >
                <Input
                  id={`${listId}-model`}
                  list={`${listId}-models`}
                  spellCheck={false}
                  placeholder={role === "light" ? preset?.exampleLightModel : preset?.exampleModel}
                  value={draft.model}
                  onChange={(e) => update({ model: e.target.value })}
                  required
                />
                <datalist id={`${listId}-models`}>
                  {suggestions.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Field>
            )}
          </div>

          {connection && (
            <div>
              <button
                type="button"
                onClick={() => setAdvanced((v) => !v)}
                className="inline-flex min-h-8 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md"
                aria-expanded={advanced}
              >
                <ChevronDown className={cn("size-3.5 transition-transform", advanced && "rotate-180")} aria-hidden />
                Generation parameters
              </button>

              {advanced && (
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <Field
                    id={`${listId}-temperature`}
                    label={`Temperature: ${draft.temperature ?? "default"}`}
                    hint="Lower is more focused. Some reasoning models ignore it."
                  >
                    <div className="flex items-center gap-2">
                      <Slider
                        id={`${listId}-temperature`}
                        min={0}
                        max={2}
                        step={0.1}
                        value={[draft.temperature ?? 1]}
                        onValueChange={([value]) => update({ temperature: Math.round(value * 10) / 10 })}
                      />
                      {draft.temperature !== null && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                          onClick={() => update({ temperature: null })}
                          aria-label="Use the default temperature"
                        >
                          <RotateCcw className="size-3.5" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </Field>

                  <Field
                    id={`${listId}-max-tokens`}
                    label="Max output tokens"
                    hint="Empty uses the provider limit. Too low cuts long tables short."
                  >
                    <Input
                      id={`${listId}-max-tokens`}
                      type="number"
                      inputMode="numeric"
                      min={16}
                      max={200000}
                      placeholder="Default"
                      value={draft.maxOutputTokens}
                      onChange={(e) => update({ maxOutputTokens: e.target.value })}
                    />
                  </Field>

                  <Field
                    id={`${listId}-reasoning`}
                    label="Reasoning"
                    hint="Thinking effort for models that support it. Extraction steps always run without it."
                  >
                    <Select
                      value={draft.reasoning}
                      onValueChange={(value) => update({ reasoning: value as ReasoningLevel })}
                    >
                      <SelectTrigger id={`${listId}-reasoning`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REASONING_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {REASONING_LABELS[level]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {dirty && (
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setDraft(toDraft(assignment))}
                disabled={pending}
              >
                Discard
              </Button>
            </div>
          )}
        </div>
      </form>
    </li>
  );
};
