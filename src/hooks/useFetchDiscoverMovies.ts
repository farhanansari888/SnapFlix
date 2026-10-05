import { getDiscoverList } from "@/actions/lists";
import { CatalogListResponse } from "@/types";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { Movie } from "tmdb-ts/dist/types";

interface FetchDiscoverMovies {
  page?: number;
  type?: DiscoverMoviesFetchQueryType;
  genres?: string;
}

/**
 * Resolves a movie collection from TMDB through a server action, so the token
 * stays on the server and the response is shared/cached across visitors.
 */
const fetchDiscoverMovies = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverMovies): Promise<CatalogListResponse<Movie>> =>
  getDiscoverList({ mediaType: "movie", type, page, genres }) as Promise<
    CatalogListResponse<Movie>
  >;

export default fetchDiscoverMovies;
