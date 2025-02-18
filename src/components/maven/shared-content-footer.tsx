"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ToggleTheme } from "./toggle-theme";
import { FC } from "react";

export const ContentSharedFooter: FC = () => {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col">
      <footer className="relative w-full py-10 px-3">
        <div className="absolute inset-0 z-0 rounded-3xl">
          <Image
            src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a31965e5-2811-4f62-96c0-f7fde5f222a5/de5q1i0-f76b868f-056f-4896-af94-85cfa22152aa.jpg/v1/fill/w_1192,h_670,q_70,strp/element_of_life_by_kuzy62_de5q1i0-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvYTMxOTY1ZTUtMjgxMS00ZjYyLTk2YzAtZjdmZGU1ZjIyMmE1XC9kZTVxMWkwLWY3NmI4NjhmLTA1NmYtNDg5Ni1hZjk0LTg1Y2ZhMjIxNTJhYS5qcGciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.kgirUYc4Qs6hcQfMCCZRR9EvMIVnICihEMv5O_c_6Jg"
            alt="Footer background"
            fill
            className="opacity-40 object-cover rounded-t-[2rem]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm font-semibold text-black/80 dark:text-white/80">
                © 2025 Market Maven.
              </p>
            </div>
            <nav className="text-black/80 dark:text-white/80 flex-wrap justify-center space-x-2 mb-4 md:mb-0">
              <Link
                href="/terms-of-service"
                className="text-sm py-1 px-2 hover:text-white hover:bg-[#1A1A1D] rounded-3xl"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy-policy"
                className="text-sm py-1 px-2 hover:text-white hover:bg-[#1A1A1D] rounded-3xl"
              >
                Privacy Policy
              </Link>
              <Link
                href={session ? "/chat" : "/login"}
                className="text-sm  py-1 px-2 hover:text-white hover:bg-[#1A1A1D] rounded-3xl"
              >
                {session ? "Go to App" : "Go to Login"}
              </Link>
            </nav>
            <ToggleTheme />
          </div>
        </div>
      </footer>
    </div>
  );
};
