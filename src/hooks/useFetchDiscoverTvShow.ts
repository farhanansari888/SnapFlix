import { getDiscoverList } from "@/actions/lists";
import { CatalogListResponse } from "@/types";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";
import { TV } from "tmdb-ts/dist/types";

interface FetchDiscoverTvShows {
  page?: number;
  type?: DiscoverTvShowsFetchQueryType;
  genres?: string;
}

/**
 * Resolves a TV collection from TMDB through a server action, so the token
 * stays on the server and the response is shared/cached across visitors.
 */
const fetchDiscoverTvShows = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverTvShows): Promise<CatalogListResponse<TV>> =>
  getDiscoverList({ mediaType: "tv", type, page, genres }) as Promise<CatalogListResponse<TV>>;

export default fetchDiscoverTvShows;
