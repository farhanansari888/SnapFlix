"use server";

const APPEND =
  "images,videos,credits,keywords,recommendations,similar,reviews,watch/providers";

type CatalogError = "not-found" | "unavailable";

export type CatalogResult<T> = { data: T } | { error: CatalogError };

function credentials() {
  const token = [
    process.env.TMDB_ACCESS_TOKEN,
    process.env.TMDB_API,
    process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
  ].find((value) => value && !value.includes("your_tmdb") && value !== "placeholder_token");
  const apiKey = [process.env.TMDB_API_KEY, process.env.NEXT_PUBLIC_TMDB_API_KEY].find(
    (value) => value && !value.includes("your_tmdb"),
  );

  return { token, apiKey };
}

async function tmdbGet(path: string, params: Record<string, string> = {}): Promise<CatalogResult<any>> {
  const { token, apiKey } = credentials();
  if (!token && !apiKey) {
    console.error("TMDB credentials are not configured");
    return { error: "unavailable" };
  }

  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 600 },
  });

  if (response.status === 404) return { error: "not-found" };
  if (!response.ok) {
    console.error(`TMDB request failed for ${path}: ${response.status}`);
    return { error: "unavailable" };
  }

  return { data: await response.json() };
}

export async function getMovieDetails(id: number): Promise<CatalogResult<any>> {
  if (!Number.isFinite(id)) return { error: "not-found" };
  return tmdbGet(`/movie/${id}`, { append_to_response: APPEND });
}

export async function getTvDetails(id: number): Promise<CatalogResult<any>> {
  if (!Number.isFinite(id)) return { error: "not-found" };
  return tmdbGet(`/tv/${id}`, { append_to_response: APPEND });
}

export async function getTvSeason(id: number, seasonNumber: number): Promise<CatalogResult<any>> {
  if (!Number.isFinite(id) || !Number.isFinite(seasonNumber)) return { error: "not-found" };
  return tmdbGet(`/tv/${id}/season/${seasonNumber}`);
}

export async function getPersonDetails(id: number): Promise<CatalogResult<any>> {
  if (!Number.isFinite(id)) return { error: "not-found" };
  return tmdbGet(`/person/${id}`, {
    append_to_response: "combined_credits,images,external_ids",
  });
}
