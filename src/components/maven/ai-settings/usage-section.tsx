"use client";

import { FC, useEffect, useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MODEL_ROLE_INFO,
  type ModelRole,
  type Preferences,
  type UsageSummary,
} from "@/lib/agents/ai-settings-schema";
import { getPreset, type ProviderId, providerIds } from "@/lib/agents/providers";
import { clearUsage, loadUsageSummary, savePreferences } from "@/lib/service/ai-settings/actions";
import { cn } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;

const formatTokens = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const providerLabel = (provider: string) =>
  provider === "maven"
    ? "Maven default"
    : (providerIds as string[]).includes(provider)
      ? getPreset(provider as ProviderId).label
      : provider;

const roleLabel = (role: string) => MODEL_ROLE_INFO[role as ModelRole]?.label ?? role;

type UsageSectionProps = {
  summary: UsageSummary;
  preferences: Preferences;
};

/** Token usage per model, role and day, plus the tracking switch. */
export const UsageSection: FC<UsageSectionProps> = ({ summary: initial, preferences }) => {
  const [summary, setSummary] = useState(initial);
  const [loading, startLoading] = useTransition();
  const [saving, startSaving] = useTransition();

  /** A server refresh (after clearing) brings a new 30 day summary. */
  useEffect(() => setSummary(initial), [initial]);

  const onRange = (days: number) =>
    startLoading(async () => {
      const result = await loadUsageSummary(days);
      if (result.ok) setSummary(result.data);
      else toast.error(result.error);
    });

  const onTrack = (trackUsage: boolean) =>
    startSaving(async () => {
      const result = await savePreferences({ ...preferences, trackUsage });
      if (!result.ok) toast.error(result.error);
      else toast.success(trackUsage ? "Usage tracking on" : "Usage tracking off");
    });

  const onClear = () =>
    startSaving(async () => {
      const result = await clearUsage();
      if (result.ok) toast.success("Usage history cleared");
      else toast.error(result.error);
    });

  const { totals } = summary;
  const peak = Math.max(1, ...summary.daily.map((d) => d.input + d.output));

  return (
    <section className="flex flex-col gap-8" aria-labelledby="usage-heading">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="usage-heading" className="text-lg font-semibold tracking-tight">
            Usage
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tokens reported by the providers for your requests. Costs depend
            on each provider&apos;s pricing.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-muted p-1" role="group" aria-label="Time range">
          {RANGES.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => onRange(days)}
              disabled={loading}
              aria-pressed={summary.days === days}
              className={cn(
                "min-h-8 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                summary.days === days && "bg-background text-foreground shadow-sm"
              )}
            >
              {days} days
            </button>
          ))}
        </div>
      </header>

      <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-5", loading && "opacity-60")}>
        {[
          ["Model calls", totals.calls],
          ["Input tokens", totals.input],
          ["Output tokens", totals.output],
          ["Reasoning tokens", totals.reasoning],
          ["Cached input", totals.cached],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {formatTokens.format(value as number)}
            </dd>
          </div>
        ))}
      </dl>

      {totals.calls === 0 ? (
        <p className="border-y border-dashed py-10 text-center text-sm text-muted-foreground">
          {preferences.trackUsage
            ? "No usage in this period yet."
            : "Usage tracking is off, so nothing is recorded."}
        </p>
      ) : (
        <>
          <div>
            <h3 className="text-sm font-medium">Daily tokens</h3>
            <div
              className="mt-3 flex h-32 items-end gap-0.5"
              role="img"
              aria-label={`Daily token usage over the last ${summary.days} days`}
            >
              {summary.daily.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${formatTokens.format(d.input)} in, ${formatTokens.format(d.output)} out`}
                  className="flex min-w-1 flex-1 flex-col justify-end"
                  style={{ height: `${((d.input + d.output) / peak) * 100}%` }}
                >
                  <div className="rounded-t-sm bg-foreground/80" style={{ flexGrow: d.output || 0.0001 }} />
                  <div className="bg-foreground/25" style={{ flexGrow: d.input || 0.0001 }} />
                </div>
              ))}
            </div>
            <p className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-foreground/25" aria-hidden /> Input
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-foreground/80" aria-hidden /> Output
              </span>
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <UsageTable
              title="By model"
              rows={summary.byModel.map((m) => ({
                key: `${m.provider}:${m.model}`,
                label: m.model,
                sub: providerLabel(m.provider),
                calls: m.calls,
                input: m.input,
                output: m.output,
              }))}
            />
            <UsageTable
              title="By role"
              rows={summary.byRole.map((r) => ({
                key: r.role,
                label: roleLabel(r.role),
                calls: r.calls,
                input: r.input,
                output: r.output,
              }))}
            />
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <label className="flex items-start gap-2.5 text-sm">
          <Checkbox
            checked={preferences.trackUsage}
            onCheckedChange={(checked) => onTrack(checked === true)}
            disabled={saving}
            className="mt-0.5"
          />
          <span>
            Record token usage
            <span className="block text-xs text-muted-foreground">
              Stores model, role and token counts per call, never the
              conversation itself.
            </span>
          </span>
        </label>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              Clear history
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-(family-name:--font-satoshi)">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear usage history?</AlertDialogTitle>
              <AlertDialogDescription>
                All recorded token usage is deleted permanently. This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClear}>Clear history</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

const UsageTable: FC<{
  title: string;
  rows: { key: string; label: string; sub?: string; calls: number; input: number; output: number }[];
}> = ({ title, rows }) => (
  <div className="min-w-0">
    <h3 className="text-sm font-medium">{title}</h3>
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 pr-3 font-normal">Name</th>
            <th className="py-2 px-3 text-right font-normal">Calls</th>
            <th className="py-2 px-3 text-right font-normal">Input</th>
            <th className="py-2 pl-3 text-right font-normal">Output</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="max-w-0 py-2.5 pr-3">
                <span className="block truncate">{row.label}</span>
                {row.sub && <span className="block truncate text-xs text-muted-foreground">{row.sub}</span>}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums">{row.calls}</td>
              <td className="py-2.5 px-3 text-right tabular-nums">{formatTokens.format(row.input)}</td>
              <td className="py-2.5 pl-3 text-right tabular-nums">{formatTokens.format(row.output)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
