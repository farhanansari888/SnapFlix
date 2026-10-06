/**
 * Server-only TMDB access layer.
 *
 * This module is the single place where the app talks to The Movie Database API
 * from the server. It is intentionally framework free (plain `fetch`) so it can
 * be used from server actions, route handlers and server components alike.
 *
 * Credentials are resolved from the same environment variables the rest of the
 * app already supports (see `.env.local.example`):
 *
 *   TMDB_ACCESS_TOKEN / TMDB_API / NEXT_PUBLIC_TMDB_ACCESS_TOKEN  (v4 bearer)
 *   TMDB_API_KEY / NEXT_PUBLIC_TMDB_API_KEY                       (v3 api key)
 */

// Overridable so a proxy/mirror (or a local mock while testing) can be used
// without touching application code.
const TMDB_BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const DEFAULT_REVALIDATE = 600; // 10 minutes
const REQUEST_TIMEOUT_MS = 10_000;

/** Placeholder values that ship with the example env files. */
const PLACEHOLDERS = ["your_tmdb", "placeholder_token", "your_api_key", "changeme"];

export type TmdbError = "unconfigured" | "unauthorized" | "not-found" | "unavailable";

export type TmdbList<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: TmdbError; message: string };

const clean = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (PLACEHOLDERS.some((placeholder) => trimmed.includes(placeholder))) return undefined;
  return trimmed;
};

/**
 * Resolves the first usable TMDB credential pair from the environment.
 * A v4 access token is preferred, a v3 api key works as a fallback.
 */
export function tmdbCredentials(): { token?: string; apiKey?: string } {
  const token = [
    process.env.TMDB_ACCESS_TOKEN,
    process.env.TMDB_API,
    process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
  ]
    .map(clean)
    .find(Boolean);

  const apiKey = [process.env.TMDB_API_KEY, process.env.NEXT_PUBLIC_TMDB_API_KEY]
    .map(clean)
    .find(Boolean);

  return { token, apiKey };
}

/** True when at least one TMDB credential is configured on the server. */
export const isTmdbConfigured = (): boolean => {
  const { token, apiKey } = tmdbCredentials();
  return Boolean(token || apiKey);
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Performs a GET request against the TMDB API.
 *
 * Never throws: network/HTTP failures are converted into a `TmdbResponse`
 * error so server actions can return a serializable result to the client
 * (thrown errors inside server actions are redacted in production).
 */
export async function tmdbFetch<T>(
  path: string,
  params: QueryParams = {},
  revalidate: number = DEFAULT_REVALIDATE,
): Promise<TmdbResponse<T>> {
  const { token, apiKey } = tmdbCredentials();

  if (!token && !apiKey) {
    return {
      ok: false,
      error: "unconfigured",
      message:
        "TMDB credentials are missing. Set TMDB_ACCESS_TOKEN (or NEXT_PUBLIC_TMDB_ACCESS_TOKEN) in your environment.",
    };
  }

  const url = new URL(`${TMDB_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  if (apiKey) url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        error: "unauthorized",
        message: "TMDB rejected the configured credentials (401/403).",
      };
    }

    if (response.status === 404) {
      return { ok: false, error: "not-found", message: `TMDB resource not found: ${path}` };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: "unavailable",
        message: `TMDB request failed for ${path} with status ${response.status}.`,
      };
    }

    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown TMDB request error";
    return { ok: false, error: "unavailable", message: `TMDB request failed: ${message}` };
  }
}

/**
 * Convenience wrapper for every paginated TMDB endpoint (`/trending`, `/movie/popular`,
 * `/search/movie`, ...) which all share the same `{page, results, total_pages, total_results}`
 * envelope. Guarantees a well formed list even when TMDB omits fields.
 */
export async function tmdbFetchList<T>(
  path: string,
  params: QueryParams = {},
  revalidate: number = DEFAULT_REVALIDATE,
): Promise<TmdbResponse<TmdbList<T>>> {
  const response = await tmdbFetch<TmdbList<T>>(path, params, revalidate);

  if (!response.ok) return response;

  const list = response.data ?? ({} as TmdbList<T>);

  return {
    ok: true,
    data: {
      page: Number(list.page) || 1,
      results: Array.isArray(list.results) ? list.results : [],
      total_pages: Number(list.total_pages) || 1,
      total_results: Number(list.total_results) || 0,
    },
  };
}
