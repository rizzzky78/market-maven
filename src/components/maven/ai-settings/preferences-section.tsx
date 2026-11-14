"use client";

import { FC, FormEvent, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  ANALYSIS_DEPTHS,
  ANALYSIS_PRIORITIES,
  type AnalysisPriority,
  CHAT_STYLES,
  CHAT_TONES,
  INSTRUCTIONS_MAX_LENGTH,
  type Preferences,
} from "@/lib/agents/ai-settings-schema";
import { savePreferences } from "@/lib/service/ai-settings/actions";
import { cn } from "@/lib/utils";
import { Field } from "./connection-dialog";

const STYLE_INFO: Record<Preferences["style"], string> = {
  concise: "Short answers that lead with the verdict",
  balanced: "Maven's default mix of answer and explanation",
  detailed: "Thorough reasoning, trade-offs and alternatives",
};

const TONE_INFO: Record<Preferences["tone"], string> = {
  neutral: "Plain and factual",
  friendly: "Warm and conversational",
  professional: "Precise, consultant-style",
};

const DEPTH_INFO: Record<Preferences["depth"], string> = {
  quick: "Only the facts that decide the purchase",
  standard: "Balanced coverage of specs and value",
  deep: "Specs, real-world performance, ownership costs, known issues",
};

const PART_FIELDS = {
  behavior: ["instructions", "style", "tone", "language"],
  analysis: ["depth", "priorities", "currency"],
} as const satisfies Record<string, readonly (keyof Preferences)[]>;

const pick = (prefs: Preferences, part: keyof typeof PART_FIELDS) =>
  Object.fromEntries(PART_FIELDS[part].map((key) => [key, prefs[key]]));

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

type PreferencesSectionProps = {
  part: "behavior" | "analysis";
  preferences: Preferences;
};

/**
 * Chat behavior (custom instructions, style, tone, language) or analysis
 * preferences (depth, priorities, budget). Both parts save the whole
 * preferences record, so each starts from the stored values.
 */
export const PreferencesSection: FC<PreferencesSectionProps> = ({ part, preferences }) => {
  const [draft, setDraft] = useState<Preferences>(preferences);
  const [budget, setBudget] = useState(preferences.budgetMax?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    JSON.stringify(pick(draft, part)) !== JSON.stringify(pick(preferences, part)) ||
    (part === "analysis" && budget !== (preferences.budgetMax?.toString() ?? ""));

  const update = (patch: Partial<Preferences>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  };

  const togglePriority = (priority: AnalysisPriority, on: boolean) =>
    update({
      priorities: on
        ? [...draft.priorities, priority]
        : draft.priorities.filter((p) => p !== priority),
    });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      /** Only this part's fields change; the rest keeps the stored values. */
      const result = await savePreferences({
        ...preferences,
        ...pick(draft, part),
        ...(part === "analysis" && { budgetMax: budget ? Number(budget) : null }),
      });
      if (!result.ok) setError(result.error);
      else toast.success(part === "behavior" ? "Chat behavior saved" : "Analysis preferences saved");
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" aria-labelledby={`${part}-heading`}>
      {part === "behavior" ? (
        <>
          <header className="max-w-2xl">
            <h2 id="behavior-heading" className="text-lg font-semibold tracking-tight">
              Chat behavior
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How Maven writes to you. These apply to the chat reply and every
              tool&apos;s insight, on Maven&apos;s models and your own.
            </p>
          </header>

          <Field
            id="pref-instructions"
            label="Custom instructions"
            hint={`${draft.instructions?.length ?? 0} / ${INSTRUCTIONS_MAX_LENGTH}. Context about you and how you like answers, such as "I live in Jakarta and prefer brands with local service centers". They cannot change Maven's tools or safety rules.`}
          >
            <Textarea
              id="pref-instructions"
              rows={6}
              maxLength={INSTRUCTIONS_MAX_LENGTH}
              placeholder="Anything Maven should always keep in mind"
              value={draft.instructions ?? ""}
              onChange={(e) => update({ instructions: e.target.value })}
              className="resize-y"
            />
          </Field>

          <OptionGroup
            label="Response style"
            value={draft.style}
            options={CHAT_STYLES}
            info={STYLE_INFO}
            onChange={(style) => update({ style })}
          />

          <OptionGroup
            label="Tone"
            value={draft.tone}
            options={CHAT_TONES}
            info={TONE_INFO}
            onChange={(tone) => update({ tone })}
          />

          <Field
            id="pref-language"
            label="Response language"
            hint="Empty replies in the language you write in."
          >
            <Input
              id="pref-language"
              maxLength={40}
              placeholder="For example English or Bahasa Indonesia"
              value={draft.language ?? ""}
              onChange={(e) => update({ language: e.target.value })}
              className="sm:max-w-sm"
            />
          </Field>
        </>
      ) : (
        <>
          <header className="max-w-2xl">
            <h2 id="analysis-heading" className="text-lg font-semibold tracking-tight">
              Analysis
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What Maven weighs when it researches, compares and recommends
              products. A request&apos;s own details always take priority.
            </p>
          </header>

          <OptionGroup
            label="Depth"
            value={draft.depth}
            options={ANALYSIS_DEPTHS}
            info={DEPTH_INFO}
            onChange={(depth) => update({ depth })}
          />

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">Priorities</legend>
            <p className="-mt-1 text-xs text-muted-foreground">
              Aspects to weigh first in comparisons and recommendations.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(ANALYSIS_PRIORITIES) as AnalysisPriority[]).map((priority) => (
                <label key={priority} className="flex min-h-9 items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={draft.priorities.includes(priority)}
                    onCheckedChange={(checked) => togglePriority(priority, checked === true)}
                  />
                  {ANALYSIS_PRIORITIES[priority]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:max-w-xl sm:grid-cols-[8rem_minmax(0,1fr)]">
            <Field id="pref-currency" label="Currency" hint="ISO code, such as IDR">
              <Input
                id="pref-currency"
                maxLength={8}
                placeholder="IDR"
                value={draft.currency ?? ""}
                onChange={(e) => update({ currency: e.target.value.toUpperCase() })}
              />
            </Field>
            <Field id="pref-budget" label="Default budget ceiling" hint="Used when a request names no budget.">
              <Input
                id="pref-budget"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="No ceiling"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setError(null);
                }}
              />
            </Field>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="rounded-full" disabled={!dirty || pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Save
        </Button>
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              setDraft(preferences);
              setBudget(preferences.budgetMax?.toString() ?? "");
            }}
            disabled={pending}
          >
            Discard
          </Button>
        )}
      </div>
    </form>
  );
};

const OptionGroup = <T extends string>({
  label,
  value,
  options,
  info,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  info: Record<T, string>;
  onChange: (value: T) => void;
}) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="text-sm font-medium">{label}</legend>
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as T)}
      className="grid gap-2 sm:grid-cols-3"
    >
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:bg-accent/50",
            value === option && "border-foreground/40 bg-accent/40"
          )}
        >
          <RadioGroupItem value={option} className="mt-0.5" />
          <span>
            {capitalize(option)}
            <span className="block text-xs text-muted-foreground">{info[option]}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  </fieldset>
);
