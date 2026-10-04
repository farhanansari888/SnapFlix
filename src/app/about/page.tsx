import FAQ from "@/components/sections/About/FAQ";
import Footer from "@/components/ui/layout/Footer";
import { siteConfig } from "@/config/site";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { NextPage } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Help Center & FAQ | ${siteConfig.name}`,
};

const highlights = [
  { label: "Catalog", value: "Movies & series" },
  { label: "Playback", value: "Adaptive streams" },
  { label: "Library", value: "Saved on your account" },
];

const AboutPage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between pt-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 md:px-8">
        <header className="cinema-panel relative overflow-hidden rounded-3xl px-6 py-8 md:px-8">
          <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-[#E50914]/25 blur-3xl" />
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-white md:text-5xl">
            How SnapFlix works
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            A private cinema catalog for discovering movies and series, picking up where you left
            off, and keeping a watchlist of your own.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                <p className="text-xs font-medium text-zinc-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <Suspense>
          <FAQ />
        </Suspense>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#161618] px-6 py-5 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-base font-bold text-white md:text-lg">Still stuck?</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Support can help with playback, accounts, and watchlist questions.
            </p>
          </div>
          <a
            href="mailto:support@snapflix.internal"
            className="rounded-md bg-[#E50914] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.35)] transition hover:bg-[#B81D24] md:text-sm"
          >
            Contact support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
