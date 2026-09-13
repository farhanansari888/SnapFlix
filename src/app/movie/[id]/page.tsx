"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import { Cast } from "tmdb-ts/dist/types/credits";
import { notFound } from "next/navigation";
import { Image } from "tmdb-ts";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
import { MOCK_MOVIES } from "@/utils/mockData";
import Footer from "@/components/ui/layout/Footer";
const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const DetailHeroBillboard = dynamic(() => import("@/components/sections/Detail/DetailHeroBillboard"));
const CastsSection = dynamic(() => import("@/components/sections/Movie/Detail/Casts"));
const RelatedSection = dynamic(() => import("@/components/sections/Movie/Detail/Related"));

const MovieDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const {
    data: movie,
    isPending,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await tmdb.movies.details(id, [
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
        console.warn("TMDB error on movie detail page, using fallback:", err);
      }
      const found = MOCK_MOVIES.find((m) => m.id.toString() === id.toString()) || MOCK_MOVIES[0];
      return {
        ...found,
        id: Number(id),
        credits: {
          cast: [
            { id: 1, name: "Lead Actor", character: "Main Protagonist", profile_path: "/b0vdub8m4vS2aWz2V0Wc9c5L3jS.jpg" },
            { id: 2, name: "Co-Star", character: "Key Ally", profile_path: "/eO0al59qpKu79WqB37bK5uR2m3y.jpg" },
          ],
          crew: [],
        },
        images: {
          backdrops: [{ file_path: found.backdrop_path, aspect_ratio: 1.78, height: 1080, width: 1920, vote_average: 8.5, vote_count: 50 }],
          posters: [{ file_path: found.poster_path, aspect_ratio: 0.67, height: 1500, width: 1000, vote_average: 8.5, vote_count: 50 }],
          logos: [],
        },
        videos: { results: [] },
        keywords: { keywords: [] },
        recommendations: { results: MOCK_MOVIES.filter((m) => m.id !== Number(id)) },
        similar: { results: MOCK_MOVIES.filter((m) => m.id !== Number(id)) },
        reviews: { results: [] },
        "watch/providers": { results: {} },
        genres: [{ id: 28, name: "Action" }, { id: 878, name: "Sci-Fi" }],
        runtime: 148,
        status: "Released",
        tagline: "Stream now on SnapFlix",
      } as any;
    },
    queryKey: ["movie-detail", id],
  });

  if (isPending) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  if (!movie) notFound();

  return (
    <div className="flex flex-col gap-10 w-full overflow-x-hidden">
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        {/* Full-bleed Home-Style Netflix Hero Billboard */}
        <DetailHeroBillboard media={movie} type="movie" />

        {/* Details & Recommended Rails */}
        <div className="mx-auto max-w-7xl w-full px-4 md:px-12 flex flex-col gap-12 pb-16">
          <CastsSection casts={movie.credits.cast as Cast[]} />
          <PhotosSection images={movie.images.backdrops as Image[]} />
          <RelatedSection movie={movie} />
        </div>
      </Suspense>

      {/* Netflix Footer */}
      <Footer />
    </div>
  );
};

export default MovieDetailPage;
