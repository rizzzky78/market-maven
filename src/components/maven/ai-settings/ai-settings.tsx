"use client";

import { FC, useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AssignmentView,
  ConnectionView,
  Preferences,
  UsageSummary,
} from "@/lib/agents/ai-settings-schema";
import { AccountSection, type AccountView } from "./account-section";
import { ConnectionsSection } from "./connections-section";
import { ModelsSection } from "./models-section";
import { PreferencesSection } from "./preferences-section";
import { UsageSection } from "./usage-section";

export const AI_SETTINGS_TABS = [
  { value: "connections", label: "Connections" },
  { value: "models", label: "Models" },
  { value: "behavior", label: "Behavior" },
  { value: "analysis", label: "Analysis" },
  { value: "usage", label: "Usage" },
  { value: "account", label: "Account" },
] as const;

type AiSettingsProps = {
  connections: ConnectionView[];
  assignments: AssignmentView[];
  preferences: Preferences;
  usage: UsageSummary;
  account: AccountView;
};

/**
 * AI settings tabs. Data comes from the server and refreshes after each
 * server action; model lists fetched by "Test" are kept here so the Models
 * tab can suggest them.
 */
export const AiSettings: FC<AiSettingsProps> = ({
  connections,
  assignments,
  preferences,
  usage,
  account,
}) => {
  const [modelCache, setModelCache] = useState<Record<string, string[]>>({});

  const onModels = useCallback(
    (connectionId: string, models: string[]) =>
      setModelCache((cache) => ({ ...cache, [connectionId]: models })),
    []
  );

  return (
    <Tabs defaultValue="connections" className="flex w-full flex-col gap-8">
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <TabsList className="h-10 rounded-full">
          {AI_SETTINGS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-full px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="connections" className="mt-0">
        <ConnectionsSection
          connections={connections}
          assignments={assignments}
          modelCache={modelCache}
          onModels={onModels}
        />
      </TabsContent>
      <TabsContent value="models" className="mt-0">
        <ModelsSection connections={connections} assignments={assignments} modelCache={modelCache} />
      </TabsContent>
      <TabsContent value="behavior" className="mt-0">
        <PreferencesSection part="behavior" preferences={preferences} />
      </TabsContent>
      <TabsContent value="analysis" className="mt-0">
        <PreferencesSection part="analysis" preferences={preferences} />
      </TabsContent>
      <TabsContent value="usage" className="mt-0">
        <UsageSection summary={usage} preferences={preferences} />
      </TabsContent>
      <TabsContent value="account" className="mt-0">
        <AccountSection account={account} />
      </TabsContent>
    </Tabs>
  );
};
