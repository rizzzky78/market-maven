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
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";

export const SidebarUserNavigation: FC = () => {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name as string,
    email: session?.user?.email as string,
    avatar: session?.user?.image as string,
  };

  return (
    <SidebarMenu className="*:font-[family-name:var(--font-satoshi)]">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
              data-testid="user-profile"
            >
              <Avatar className="h-8 w-8 rounded-lg hover:rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg hover:rounded-full">
                  MM
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-t-3xl rounded-b-[1.2rem]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="font-[family-name:var(--font-satoshi)] flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="font-[family-name:var(--font-satoshi)] *:rounded-3xl *:gap-1 *:text-xs *:cursor-pointer">
              <DropdownMenuItem>
                <Link href={"/history"} className="flex items-center">
                  <History className="size-4 mr-2" />
                  My Chat History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={"/cookbook"}
                  className="flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookText className="size-4 mr-2" />
                  Cookbook
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={"/terms-of-service"}
                  className="flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MonitorCheck className="size-4 mr-2" />
                  Terms of Service
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={"/privacy-policy"}
                  className="flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShieldAlert className="size-4 mr-2" />
                  Privacy Policy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => await signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="text-red-400" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
