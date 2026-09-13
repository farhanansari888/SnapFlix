"use client";

import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { Spinner } from "@heroui/react";
import { useScrollIntoView } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import dynamic from "next/dynamic";
import { NextPage } from "next";
import { MOCK_TV_SHOWS } from "@/utils/mockData";
const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const TvShowRelatedSection = dynamic(() => import("@/components/sections/TV/Details/Related"));
const TvShowCastsSection = dynamic(() => import("@/components/sections/TV/Details/Casts"));
const DetailHeroBillboard = dynamic(() => import("@/components/sections/Detail/DetailHeroBillboard"));
const TvShowsSeasonsSelection = dynamic(() => import("@/components/sections/TV/Details/Seasons"));

const TVShowDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    duration: 500,
  });

  const {
    data: tv,
    isPending,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await tmdb.tvShows.details(id, [
          "images",
          "videos",
          "credits",
          "keywords",
          "recommendations",
          "similar",
          "reviews",
          "watch/providers",
        ]);
        if (res && res.id) return res;
      } catch (err) {
        console.warn("TMDB error on tv show detail page, using fallback:", err);
      }
      const found = MOCK_TV_SHOWS.find((t) => t.id.toString() === id.toString()) || MOCK_TV_SHOWS[0];
      return {
        ...found,
        id: Number(id),
        credits: {
          cast: [
            { id: 1, name: "Lead Character", character: "Main Cast", profile_path: "/b0vdub8m4vS2aWz2V0Wc9c5L3jS.jpg" },
            { id: 2, name: "Supporting Star", character: "Key Character", profile_path: "/eO0al59qpKu79WqB37bK5uR2m3y.jpg" },
          ],
          crew: [],
        },
        images: {
          backdrops: [{ file_path: found.backdrop_path, aspect_ratio: 1.78, height: 1080, width: 1920, vote_average: 8.5, vote_count: 50 }],
          posters: [{ file_path: found.poster_path, aspect_ratio: 0.67, height: 1500, width: 1000, vote_average: 8.5, vote_count: 50 }],
          logos: [],
        },
        videos: { results: [] },
        keywords: { results: [] },
        recommendations: { results: MOCK_TV_SHOWS.filter((t) => t.id !== Number(id)) },
        similar: { results: MOCK_TV_SHOWS.filter((t) => t.id !== Number(id)) },
        reviews: { results: [] },
        "watch/providers": { results: {} },
        seasons: [
          {
            id: 1,
            name: "Season 1",
            season_number: 1,
            episode_count: 10,
            air_date: "2024-01-01",
            overview: "Season 1 of SnapFlix series.",
            poster_path: found.poster_path,
          },
        ],
        number_of_seasons: 1,
        number_of_episodes: 10,
        genres: [{ id: 18, name: "Drama" }, { id: 10765, name: "Sci-Fi & Fantasy" }],
        tagline: "Stream now exclusively on SnapFlix",
      } as any;
    },
    queryKey: ["tv-show-detail", id],
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl">
        <Spinner size="lg" className="absolute-center" color="danger" variant="simple" />
      </div>
    );
  }

  if (!tv) notFound();

  return (
    <div className="flex flex-col gap-10 w-full overflow-x-hidden">
      <Suspense
        fallback={
          <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />
        }
      >
        {/* Full-bleed Home-Style Netflix Hero Billboard */}
        <DetailHeroBillboard
          media={tv}
          type="tv"
          onViewEpisodesClick={() => scrollIntoView({ alignment: "center" })}
        />

        {/* Episodes, Cast, Photos & Related Rails */}
        <div className="mx-auto max-w-7xl w-full px-4 md:px-12 flex flex-col gap-12 pb-16">
          <TvShowsSeasonsSelection ref={targetRef} id={id} seasons={tv.seasons} />
          <TvShowCastsSection casts={tv.credits.cast} />
          <PhotosSection images={tv.images.backdrops} type="tv" />
          <TvShowRelatedSection tv={tv} />
        </div>
      </Suspense>
    </div>
  );
};

export default TVShowDetailPage;
