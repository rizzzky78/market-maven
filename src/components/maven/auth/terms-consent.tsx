"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { FC } from "react";

type TermsConsentProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Terms of Service and Privacy Policy consent, required before signing in. */
export const TermsConsent: FC<TermsConsentProps> = ({
  checked,
  onCheckedChange,
}) => (
  <div className="flex flex-col *:text-xs w-full font-(family-name:--font-khand)">
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        id="terms"
        className="w-[0.8rem] h-[0.8rem] focus:w-[0.8rem] focus:h-[0.8rem] checked:w-[0.8rem] checked:h-[0.8rem]"
      />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Continue accept terms and conditions
      </label>
    </div>
    <div className="pl-5 w-full">
      <p className="text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </div>
  </div>
);
