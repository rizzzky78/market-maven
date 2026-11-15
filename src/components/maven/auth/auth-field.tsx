"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ComponentProps, FC, ReactNode, useId } from "react";

type AuthFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  label: string;
  /** Inline error under the input; also sets `aria-invalid`. */
  error?: string | null;
  /** Helper text shown when there is no error. */
  hint?: ReactNode;
  /** Optional element at the right of the label row, e.g. a link. */
  labelAction?: ReactNode;
};

/** Labeled input styled for the auth cards, with inline error and hint. */
export const AuthField: FC<AuthFieldProps> = ({
  label,
  error,
  hint,
  labelAction,
  className,
  ...props
}) => {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className="grid gap-1.5 font-(family-name:--font-khand)">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-base text-black/80 dark:text-white/80">
          {label}
        </Label>
        {labelAction}
      </div>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          "h-12 rounded-3xl border-black/20 bg-transparent px-5 text-lg text-black dark:border-white/20 dark:text-white md:text-lg aria-invalid:border-red-500",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={messageId} role="alert" className="pl-5 text-sm text-red-500">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="pl-5 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

/** Form-level error banner for the auth cards. */
export const AuthFormError: FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <p
      role="alert"
      className="font-(family-name:--font-khand) rounded-3xl bg-red-500/10 px-5 py-3 text-base text-red-600 dark:text-red-400"
    >
      {message}
    </p>
  ) : null;

/** Primary submit button styled like the existing auth buttons. */
export const authSubmitClassName =
  "w-full text-lg rounded-3xl py-6 font-(family-name:--font-khand) bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600";
