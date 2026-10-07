"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails } from "@/actions/catalog";
import { tmdb } from "@/api/tmdb";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
import { siteConfig } from "@/config/site";
import { useDocumentTitle } from "@mantine/hooks";
import Footer from "@/components/ui/layout/Footer";
import { Skeleton } from "@heroui/react";

const PersonHeroBillboard = dynamic(() => import("@/components/sections/Person/HeroBillboard"));
const PersonFacts = dynamic(() => import("@/components/sections/Person/Facts"));
const PersonKnownFor = dynamic(() => import("@/components/sections/Person/KnownFor"));
const PersonFilmography = dynamic(() => import("@/components/sections/Person/Filmography"));

const PersonDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const {
    data: result,
    isPending,
  } = useQuery({
    queryFn: async () => {
      const serverResult = await getPersonDetails(Number(id));
      if ("data" in serverResult || serverResult.error === "not-found") return serverResult;
      try {
        const res = await tmdb.people.details(Number(id), [
          "combined_credits",
          "images",
          "external_ids",
        ]);
        if (res?.id) return { data: res };
      } catch (err) {
        console.warn("TMDB person details failed", err);
      }
      return serverResult;
    },
    queryKey: ["person-detail", id],
  });

  const person = result && "data" in result ? result.data : null;

  useDocumentTitle(person ? `${person.name} | ${siteConfig.name}` : siteConfig.name);

  if (isPending) {
    return (
      <div className="relative h-[62dvh] min-h-[420px] w-full overflow-hidden bg-[#0c0c0e] sm:h-[70dvh] lg:h-[78dvh]">
        <Skeleton className="size-full rounded-none opacity-20" />
      </div>
    );
  }

  if (result && "error" in result && result.error === "not-found") notFound();
  if (!person) {
    return (
      <p className="px-6 py-24 text-center text-sm text-white/70">
        This person could not be loaded from TMDB.
      </p>
    );
  }

  const combinedCast = person.combined_credits?.cast || [];

  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        <PersonHeroBillboard person={person} />

        <div className="relative z-10 flex flex-col gap-8 pt-2 pb-16 md:gap-11">
          <PersonFacts person={person} />
          <PersonKnownFor credits={combinedCast} />
          <PersonFilmography credits={combinedCast} />
        </div>
      </Suspense>

      <Footer />
    </div>
  );
};

export default PersonDetailPage;
