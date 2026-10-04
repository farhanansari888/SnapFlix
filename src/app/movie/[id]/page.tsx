"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "@/actions/catalog";
import { tmdb } from "@/api/tmdb";
import { Cast } from "tmdb-ts/dist/types/credits";
import { notFound } from "next/navigation";
import { Image } from "tmdb-ts";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
import { mutateMovieTitle } from "@/utils/movies";
import { siteConfig } from "@/config/site";
import { useDocumentTitle } from "@mantine/hooks";
import Footer from "@/components/ui/layout/Footer";
import { Skeleton } from "@heroui/react";
const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const DetailHeroBillboard = dynamic(() => import("@/components/sections/Detail/DetailHeroBillboard"));
const CastsSection = dynamic(() => import("@/components/sections/Movie/Detail/Casts"));
const RelatedSection = dynamic(() => import("@/components/sections/Movie/Detail/Related"));
const MovieFacts = dynamic(() => import("@/components/sections/Movie/Detail/Facts"));

const MovieDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const {
    data: result,
    isPending,
  } = useQuery({
    queryFn: async () => {
      const serverResult = await getMovieDetails(Number(id));
      if ("data" in serverResult || serverResult.error === "not-found") return serverResult;
      try {
        const res = await tmdb.movies.details(Number(id), [
          "images",
          "videos",
          "credits",
          "keywords",
          "recommendations",
          "similar",
          "reviews",
          "watch/providers",
        ]);
        if (res?.id) return { data: res };
      } catch (err) {
        console.warn("TMDB movie details failed", err);
      }
      return serverResult;
    },
    queryKey: ["movie-detail", id],
  });

  const movie = result && "data" in result ? result.data : null;

  useDocumentTitle(movie ? `${mutateMovieTitle(movie)} | ${siteConfig.name}` : siteConfig.name);

  if (isPending) {
    return (
      <div className="relative h-[62dvh] min-h-[420px] w-full overflow-hidden bg-[#0c0c0e] sm:h-[70dvh] lg:h-[78dvh]">
        <Skeleton className="size-full rounded-none opacity-20" />
      </div>
    );
  }

  if (result && "error" in result && result.error === "not-found") notFound();
  if (!movie) {
    return (
      <p className="px-6 py-24 text-center text-sm text-white/70">
        This film could not be loaded from TMDB.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        <DetailHeroBillboard media={movie} type="movie" />

        <div className="relative z-10 flex flex-col gap-8 pt-2 pb-16 md:gap-11">
          <MovieFacts movie={movie} />
          <CastsSection casts={(movie.credits?.cast || []) as Cast[]} />
          <PhotosSection images={movie.images.backdrops as Image[]} heading="row" />
          <RelatedSection movie={movie} />
        </div>
      </Suspense>

      {/* Netflix Footer */}
      <Footer />
    </div>
  );
};

export default MovieDetailPage;
