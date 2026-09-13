import { Database } from "@/utils/supabase/types";
import { ContentType } from ".";

export type HistoryDetail = Database["public"]["Tables"]["histories"]["Row"];

export type SavedMovieDetails = {
  adult: boolean;
  type: ContentType;
  backdrop_path: string;
  id: number;
  poster_path?: string;
  release_date: string;
  title: string;
  vote_average: number;
  saved_date: string;
};

export const DISCOVER_MOVIES_VALID_QUERY_TYPES = [
  "discover",
  "todayTrending",
  "thisWeekTrending",
  "popular",
  "nowPlaying",
  "upcoming",
  "topRated",
] as const;

export type DiscoverMoviesFetchQueryType = (typeof DISCOVER_MOVIES_VALID_QUERY_TYPES)[number];

export const DISCOVER_TVS_VALID_QUERY_TYPES = [
  "discover",
  "todayTrending",
  "thisWeekTrending",
  "popular",
  "onTheAir",
  "topRated",
] as const;

export type DiscoverTvShowsFetchQueryType = (typeof DISCOVER_TVS_VALID_QUERY_TYPES)[number];
