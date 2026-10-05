import { CatalogError, CatalogListResponse } from "@/types";

/**
 * Error thrown on the client when a catalog server action reports a failure.
 * React Query surfaces this through `error`, which the UI renders as a
 * retryable error state instead of silently substituting placeholder data.
 */
export class CatalogRequestError extends Error {
  readonly code: CatalogError;

  constructor(code: CatalogError, message: string) {
    super(message);
    this.name = "CatalogRequestError";
    this.code = code;
  }
}

/**
 * Unwraps the result of a catalog server action.
 *
 * @throws CatalogRequestError when the action could not reach TMDB, so the
 * calling query lands in an error state instead of rendering empty lists.
 */
export const unwrapCatalog = <T>(response: CatalogListResponse<T>) => {
  if (response?.ok) return response.data;

  throw new CatalogRequestError(
    response?.error ?? "unavailable",
    response?.message ?? "Unable to load titles right now.",
  );
};

/** Human friendly copy for every catalog failure mode. */
export const catalogErrorCopy = (code?: CatalogError): { title: string; description: string } => {
  switch (code) {
    case "unconfigured":
      return {
        title: "TMDB is not configured",
        description:
          "Add a TMDB read access token to your environment (TMDB_ACCESS_TOKEN or NEXT_PUBLIC_TMDB_ACCESS_TOKEN) and restart the server to load real titles.",
      };
    case "unauthorized":
      return {
        title: "TMDB rejected the credentials",
        description:
          "The configured TMDB access token or API key is invalid or expired. Update it in your environment and try again.",
      };
    case "not-found":
      return {
        title: "Title not found",
        description: "TMDB has no record for this title. It may have been removed or merged.",
      };
    default:
      return {
        title: "Couldn't reach TMDB",
        description:
          "The movie database did not respond. Check your connection or API quota, then try again.",
      };
  }
};
