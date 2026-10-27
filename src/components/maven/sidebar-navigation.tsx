"use client";

import {
  BookText,
  ChevronsUpDown,
  History,
  LogOut,
  MonitorCheck,
  ShieldAlert,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FC } from "react";

const externalLinks = [
  {
    href: "https://maven-ai-webpage.vercel.app/cookbook",
    label: "Cookbook",
    icon: BookText,
  },
  {
    href: "https://maven-ai-webpage.vercel.app/terms-of-service",
    label: "Terms of service",
    icon: MonitorCheck,
  },
  {
    href: "https://maven-ai-webpage.vercel.app/privacy-policy",
    label: "Privacy policy",
    icon: ShieldAlert,
  },
];

export const SidebarUserNavigation: FC = () => {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();
  const router = useRouter();

  const user = {
    name: session?.user?.name ?? undefined,
    email: session?.user?.email ?? undefined,
    avatar: session?.user?.image ?? undefined,
  };
  const initials =
    (user.name ?? user.email ?? "?")
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
              data-testid="user-profile"
            >
              <Avatar className="size-8 rounded-full">
                <AvatarImage src={user.avatar} alt="" />
                <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name ?? "Guest"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl font-(family-name:--font-satoshi)"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage src={user.avatar} alt="" />
                  <AvatarFallback className="rounded-full">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.name ?? "Guest"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/history">
                  <History />
                  Chat history
                </Link>
              </DropdownMenuItem>
              {externalLinks.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} target="_blank" rel="noopener noreferrer">
                    <Icon />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive dark:text-red-400 dark:focus:text-red-400"
              onClick={() =>
                signOut({
                  fetchOptions: { onSuccess: () => router.push("/login") },
                })
              }
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
