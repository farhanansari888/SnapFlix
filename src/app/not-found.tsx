"use client";

import { siteConfig } from "@/config/site";
import { BebasNeue } from "@/utils/fonts";
import { useDocumentTitle } from "@mantine/hooks";
import Link from "next/link";

export default function NotFound() {
  useDocumentTitle(`404 Not Found | ${siteConfig.name}`);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.22),transparent_58%)]" />
      <p className="relative text-[11px] font-bold tracking-[0.42em] text-[#E50914] uppercase">
        Lost in the catalog
      </p>
      <h1
        className={`${BebasNeue.className} relative mt-2 text-[7.5rem] leading-none text-white sm:text-[10rem]`}
      >
        404
      </h1>
      <p className="relative max-w-md text-sm text-zinc-400 sm:text-base">
        This title isn&apos;t in the SnapFlix lineup. It may have moved, or the link is no longer
        playing.
      </p>
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/85"
        >
          Back home
        </Link>
        <Link
          href="/discover"
          className="rounded-md border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Browse catalog
        </Link>
      </div>
    </div>
  );
}
