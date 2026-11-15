import { ComponentProps, FC, ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppHeaderProps extends Omit<ComponentProps<"header">, "title"> {
  /** Page title, truncated on narrow viewports. */
  title: string;
  /** Trailing controls such as the share button. */
  actions?: ReactNode;
}

/**
 * Sticky top bar of every page inside the app shell, with the sidebar
 * trigger available on all viewports.
 */
export const AppHeader: FC<AppHeaderProps> = ({
  title,
  actions,
  className,
  ...props
}) => (
  <header
    className={cn(
      "sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-sm md:px-4",
      className
    )}
    {...props}
  >
    <SidebarTrigger
      className="-ml-1 size-9 md:size-8"
      aria-label="Toggle sidebar"
      data-testid="toggle-sidebar"
    />
    <Separator orientation="vertical" className="mr-1 h-4" />
    <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{title}</h1>
    {actions}
  </header>
);
