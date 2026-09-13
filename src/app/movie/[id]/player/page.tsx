"use client";

import { tmdb } from "@/api/tmdb";
import { getMovieLastPosition } from "@/actions/histories";
import MoviePlayer from "@/components/sections/Movie/Player/Player";
import { Params } from "@/types";
import { MOCK_MOVIES } from "@/utils/mockData";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import { use } from "react";

const MoviePlayerPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const { data: movie, isPending } = useQuery({
    queryFn: async () => {
      try {
        const res = await tmdb.movies.details(id);
        if (res && res.id) return res;
      } catch (err) {
        console.warn("TMDB error in movie player, using fallback data:", err);
      }
      const found = MOCK_MOVIES.find((m) => m.id.toString() === id.toString()) || MOCK_MOVIES[0];
      return {
        ...found,
        id: Number(id),
        genres: [{ id: 28, name: "Action" }, { id: 878, name: "Sci-Fi" }],
        runtime: 152,
        status: "Released",
        tagline: "Stream now on SnapFlix",
      } as any;
    },
    queryKey: ["movie-player-detail", id],
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getMovieLastPosition(id),
    queryKey: ["movie-player-start-at", id],
  });

  if (isPending || isPendingStartAt) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  const movieData =
    movie ||
    MOCK_MOVIES.find((m) => m.id.toString() === id.toString()) ||
    ({
      id: Number(id),
      title: "SnapFlix Movie",
      original_title: "SnapFlix Movie",
      overview: "Streaming now on SnapFlix",
      backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520gh0.jpg",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      release_date: "2024-01-01",
      vote_average: 8.0,
      genres: [],
      runtime: 120,
    } as any);

  return <MoviePlayer movie={movieData} startAt={startAt} />;
};

export default MoviePlayerPage;
