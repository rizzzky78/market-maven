"use client";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MavenSidebar } from "./maven-sidebar";
import { ChatProperties } from "@/lib/types/ai";
import { ShareButton } from "./share-button";

export function Chat({ chat }: { chat: ChatProperties }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <MavenSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background px-4 py-2">
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 md:hidden"
              />
              <div>
                <p>Hello World!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ShareButton
                title="Chat"
                subtitle="Lenovo Yoga Laptops: Prices, Specs & Top Picks"
                callId="5936071e-ace4-4973-8176-8c84a1dfb45e"
                type={"public-chat"}
              />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video h-12 w-full rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
