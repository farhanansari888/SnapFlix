"use client";

import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import dynamic from "next/dynamic";
import { NextPage } from "next";
import { getTvShowLastPosition } from "@/actions/histories";
import { MOCK_TV_SHOWS } from "@/utils/mockData";
const TvShowPlayer = dynamic(() => import("@/components/sections/TV/Player/Player"));

const TvShowPlayerPage: NextPage<Params<{ id: number; season: number; episode: number }>> = ({
  params,
}) => {
  const { id, season, episode } = use(params);

  const { data: tv, isPending: isPendingTv } = useQuery({
    queryFn: async () => {
      try {
        const res = await tmdb.tvShows.details(id);
        if (res && res.id) return res;
      } catch (err) {
        console.warn("TMDB error in tv player details:", err);
      }
      const found = MOCK_TV_SHOWS.find((t) => t.id.toString() === id.toString()) || MOCK_TV_SHOWS[0];
      return {
        ...found,
        id: Number(id),
        seasons: [{ id: 1, name: "Season 1", season_number: 1, episode_count: 10 }],
      } as any;
    },
    queryKey: ["tv-show-player-details", id],
  });

  const { data: seasonDetail, isPending: isPendingSeason } = useQuery({
    queryFn: async () => {
      try {
        const res = await tmdb.tvShows.season(id, season);
        if (res && res.episodes?.length > 0) return res;
      } catch (err) {
        console.warn("TMDB error in tv season details:", err);
      }
      return {
        id: Number(id),
        name: `Season ${season}`,
        season_number: Number(season),
        episodes: Array.from({ length: 12 }).map((_, i) => ({
          id: i + 1,
          name: `Episode ${i + 1}`,
          overview: "Stream this episode now on SnapFlix.",
          episode_number: i + 1,
          season_number: Number(season),
          air_date: "2024-01-01",
          still_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
          vote_average: 8.5,
          vote_count: 600,
        })),
      } as any;
    },
    queryKey: ["tv-show-season", id, season],
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getTvShowLastPosition(id, season, episode),
    queryKey: ["tv-show-player-start-at", id, season, episode],
  });

  if (isPendingTv || isPendingSeason || isPendingStartAt) {
    return <Spinner size="lg" className="absolute-center" color="primary" variant="simple" />;
  }

  const episodesList = seasonDetail?.episodes || [
    {
      id: Number(episode),
      name: `Episode ${episode}`,
      overview: "Stream now on SnapFlix.",
      episode_number: Number(episode),
      season_number: Number(season),
      air_date: "2024-01-01",
      still_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      vote_average: 8.5,
      vote_count: 500,
    },
  ];

  const EPISODE =
    episodesList.find((e: any) => e.episode_number.toString() === episode.toString()) ||
    episodesList[0];

  const currentEpisodeIndex = episodesList.findIndex(
    (e: any) => e.episode_number === EPISODE.episode_number,
  );

  const nextEpisodeNumber =
    currentEpisodeIndex < episodesList.length - 1
      ? episodesList[currentEpisodeIndex + 1].episode_number
      : null;

  const prevEpisodeNumber =
    currentEpisodeIndex > 0 ? episodesList[currentEpisodeIndex - 1].episode_number : null;

  const tvData =
    tv ||
    MOCK_TV_SHOWS.find((t) => t.id.toString() === id.toString()) ||
    ({
      id: Number(id),
      name: "SnapFlix Series",
      original_name: "SnapFlix Series",
      overview: "Streaming now on SnapFlix.",
      first_air_date: "2024-01-01",
      vote_average: 8.5,
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    } as any);

  return (
    <TvShowPlayer
      tv={tvData}
      id={Number(id)}
      seriesName={tvData.name}
      seasonName={seasonDetail?.name || `Season ${season}`}
      episode={EPISODE}
      episodes={episodesList}
      nextEpisodeNumber={nextEpisodeNumber}
      prevEpisodeNumber={prevEpisodeNumber}
      startAt={startAt}
    />
  );
};

export default TvShowPlayerPage;
