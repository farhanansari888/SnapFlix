"use server";

import { tmdbFetchList } from "@/api/tmdb-server";
import {
  CatalogList,
  CatalogListResponse,
  ContentType,
  MovieListType,
  TrendingWindow,
  TvListType,
} from "@/types";
import type { Movie, TV } from "tmdb-ts/dist/types";

/** Revalidation window (seconds) shared by every catalog list. */
const REVALIDATE = 600;

/** TMDB rejects pages above 500, keep every request inside the valid range. */
const normalizePage = (page: unknown): number => {
  const parsed = Number(page);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(1, Math.floor(parsed)), 500);
};

/** Server actions are public endpoints: never trust the incoming query. */
const normalizeQuery = (query: unknown): string =>
  typeof query === "string" ? query.trim().slice(0, 200) : "";

const MOVIE_LIST_PATHS: Record<MovieListType, string> = {
  popular: "/movie/popular",
  nowPlaying: "/movie/now_playing",
  upcoming: "/movie/upcoming",
  topRated: "/movie/top_rated",
};

const TV_LIST_PATHS: Record<TvListType, string> = {
  popular: "/tv/popular",
  onTheAir: "/tv/on_the_air",
  topRated: "/tv/top_rated",
};

const isMovieListType = (type: string): type is MovieListType =>
  type in MOVIE_LIST_PATHS;

const isTvListType = (type: string): type is TvListType => type in TV_LIST_PATHS;

/**
 * Resolves the TMDB path for a collection used by the home rows and the
 * discover page (trending, popular, now playing, on the air, ...).
 */
const collectionPath = (
  mediaType: ContentType,
  type: string,
): string | undefined => {
  if (type === "todayTrending") return `/trending/${mediaType}/day`;
  if (type === "thisWeekTrending") return `/trending/${mediaType}/week`;
  if (mediaType === "movie" && isMovieListType(type)) return MOVIE_LIST_PATHS[type];
  if (mediaType === "tv" && isTvListType(type)) return TV_LIST_PATHS[type];
  return undefined;
};

/** Trending movies or TV shows for the given time window. */
export async function getTrendingList({
  mediaType = "movie",
  timeWindow = "day",
  page = 1,
}: {
  mediaType?: ContentType;
  timeWindow?: TrendingWindow;
  page?: number;
}): Promise<CatalogListResponse<Movie | TV>> {
  return tmdbFetchList<Movie | TV>(
    `/trending/${mediaType}/${timeWindow}`,
    { page: normalizePage(page) },
    REVALIDATE,
  );
}

/** Trending movies for the given time window. */
export async function getTrendingMovies({
  timeWindow = "day",
  page = 1,
}: {
  timeWindow?: TrendingWindow;
  page?: number;
}): Promise<CatalogListResponse<Movie>> {
  return tmdbFetchList<Movie>(`/trending/movie/${timeWindow}`, { page: normalizePage(page) }, REVALIDATE);
}

/** Trending TV shows for the given time window. */
export async function getTrendingTvShows({
  timeWindow = "day",
  page = 1,
}: {
  timeWindow?: TrendingWindow;
  page?: number;
}): Promise<CatalogListResponse<TV>> {
  return tmdbFetchList<TV>(`/trending/tv/${timeWindow}`, { page: normalizePage(page) }, REVALIDATE);
}

/**
 * Personalized picks seeded from a handful of recently watched titles.
 *
 * Fetches TMDB's "recommendations" for each seed id in parallel (server side,
 * so the TMDB token never reaches the browser), merges the results, drops
 * duplicates and anything already in the viewer's watch history, then ranks
 * what's left by rating. Used to replace "today's trending" on the home
 * billboard once a viewer (guest or signed in) has watch history.
 */
export async function getRecommendationsFromHistory({
  mediaType = "movie",
  seedIds,
  excludeIds = [],
}: {
  mediaType?: ContentType;
  seedIds: number[];
  excludeIds?: number[];
}): Promise<CatalogListResponse<Movie | TV>> {
  const ids = Array.from(new Set(seedIds.filter((id) => Number.isFinite(id) && id > 0))).slice(
    0,
    5,
  );

  if (ids.length === 0) {
    return { ok: true, data: { page: 1, results: [], total_pages: 1, total_results: 0 } };
  }

  const responses = await Promise.all(
    ids.map((id) => tmdbFetchList<Movie | TV>(`/${mediaType}/${id}/recommendations`, {}, REVALIDATE)),
  );

  const okResponses = responses.filter(
    (response): response is { ok: true; data: CatalogList<Movie | TV> } => response.ok,
  );

  // Every seed call failed: surface the first error so the caller can decide
  // whether to fall back (e.g. to trending) instead of showing an empty row.
  if (okResponses.length === 0) {
    return responses[0] as CatalogListResponse<Movie | TV>;
  }

  const exclude = new Set(excludeIds);
  const merged = new Map<number, Movie | TV>();
  for (const response of okResponses) {
    for (const item of response.data.results) {
      if (!item?.id || exclude.has(item.id) || merged.has(item.id)) continue;
      merged.set(item.id, item);
    }
  }

  const results = Array.from(merged.values()).sort(
    (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
  );

  return { ok: true, data: { page: 1, results, total_pages: 1, total_results: results.length } };
}

/** Any movie collection: popular, now playing, upcoming or top rated. */
export async function getMovieList({
  type = "popular",
  page = 1,
}: {
  type?: MovieListType;
  page?: number;
}): Promise<CatalogListResponse<Movie>> {
  const path = MOVIE_LIST_PATHS[type] ?? MOVIE_LIST_PATHS.popular;
  return tmdbFetchList<Movie>(path, { page: normalizePage(page) }, REVALIDATE);
}

/** Any TV collection: popular, on the air or top rated. */
export async function getTvList({
  type = "popular",
  page = 1,
}: {
  type?: TvListType;
  page?: number;
}): Promise<CatalogListResponse<TV>> {
  const path = TV_LIST_PATHS[type] ?? TV_LIST_PATHS.popular;
  // Popular/on the air/top rated payloads omit the `adult` flag, the card
  // components only read it for a badge, so the cast keeps the shared TV shape.
  return tmdbFetchList<TV>(path, { page: normalizePage(page) }, REVALIDATE);
}

/**
 * Single entry point for the discover page: handles the raw `/discover`
 * endpoint (with genre filtering) plus every named collection.
 */
export async function getDiscoverList({
  mediaType = "movie",
  type = "discover",
  page = 1,
  genres,
}: {
  mediaType?: ContentType;
  type?: string;
  page?: number;
  genres?: string | null;
}): Promise<CatalogListResponse<Movie | TV>> {
  if (type === "discover") {
    return tmdbFetchList<Movie | TV>(
      `/discover/${mediaType}`,
      {
        page: normalizePage(page),
        include_adult: false,
        sort_by: "popularity.desc",
        with_genres: genres || undefined,
      },
      REVALIDATE,
    );
  }

  const path = collectionPath(mediaType, type);
  if (!path) {
    return tmdbFetchList<Movie | TV>(
      `/discover/${mediaType}`,
      { page: normalizePage(page), include_adult: false, sort_by: "popularity.desc" },
      REVALIDATE,
    );
  }

  return tmdbFetchList<Movie | TV>(path, { page: normalizePage(page) }, REVALIDATE);
}

/** Full text search across movies. */
export async function searchMovies({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}): Promise<CatalogListResponse<Movie>> {
  const searchQuery = normalizeQuery(query);
  if (!searchQuery) {
    return { ok: true, data: { page: 1, results: [], total_pages: 1, total_results: 0 } };
  }

  return tmdbFetchList<Movie>(
    "/search/movie",
    { query: searchQuery, page: normalizePage(page), include_adult: false },
    REVALIDATE,
  );
}

/** Full text search across TV shows. */
export async function searchTvShows({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}): Promise<CatalogListResponse<TV>> {
  const searchQuery = normalizeQuery(query);
  if (!searchQuery) {
    return { ok: true, data: { page: 1, results: [], total_pages: 1, total_results: 0 } };
  }

  return tmdbFetchList<TV>(
    "/search/tv",
    { query: searchQuery, page: normalizePage(page), include_adult: false },
    REVALIDATE,
  );
}

/**
 * Merged movie + TV search used by the navbar quick search.
 * Both requests run in parallel server side, so the client only pays for one
 * round trip and never needs a TMDB token of its own.
 */
export async function searchTitles({
  query,
  limit = 8,
}: {
  query: string;
  limit?: number;
}): Promise<
  | {
      ok: true;
      data: {
        id: number;
        title: string;
        poster_path: string | null;
        backdrop_path: string | null;
        release_date: string;
        vote_average: number;
        overview: string;
        media_type: ContentType;
      }[];
    }
  | { ok: false; error: string; message: string }
> {
  const trimmed = normalizeQuery(query);
  if (!trimmed) return { ok: true, data: [] };

  const [movies, tvShows] = await Promise.all([
    searchMovies({ query: trimmed }),
    searchTvShows({ query: trimmed }),
  ]);

  if (!movies.ok && !tvShows.ok) {
    return {
      ok: false,
      error: movies.error,
      message: movies.message || tvShows.message,
    };
  }

  const movieItems = (movies.ok ? movies.data.results : []).map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
    release_date: movie.release_date ?? "",
    vote_average: movie.vote_average ?? 0,
    overview: movie.overview ?? "",
    media_type: "movie" as ContentType,
  }));

  const tvItems = (tvShows.ok ? tvShows.data.results : []).map((tv) => ({
    id: tv.id,
    title: tv.name,
    poster_path: tv.poster_path ?? null,
    backdrop_path: tv.backdrop_path ?? null,
    release_date: tv.first_air_date ?? "",
    vote_average: tv.vote_average ?? 0,
    overview: tv.overview ?? "",
    media_type: "tv" as ContentType,
  }));

  // Interleave both lists so the TMDB relevance ordering of each is kept.
  const merged: typeof movieItems = [];
  const maxLength = Math.max(movieItems.length, tvItems.length);
  for (let index = 0; index < maxLength; index++) {
    if (movieItems[index]) merged.push(movieItems[index]);
    if (tvItems[index]) merged.push(tvItems[index]);
  }

  return { ok: true, data: merged.slice(0, limit) };
}
