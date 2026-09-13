"use client";

import { tmdb } from "@/api/tmdb";
import { queryClient } from "@/app/providers";
import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Movie, Search, TV } from "tmdb-ts/dist/types";
import MoviePosterCard from "../Movie/Cards/Poster";
import SearchFilter from "./Filter";

import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";
import { useSearchParams } from "next/navigation";

type FetchType = {
  page: number;
  type: ContentType;
  query: string;
};

const fetchData = async ({
  page,
  type = "movie",
  query,
}: FetchType): Promise<Search<Movie> | Search<TV>> => {
  try {
    if (type === "movie") {
      const res = await tmdb.search.movies({ query, page });
      if (res && res.results && res.results.length > 0) return res;
    } else {
      const res = await tmdb.search.tvShows({ query, page });
      if (res && res.results && res.results.length > 0) return res;
    }
  } catch (err) {
    console.warn("TMDB search error, searching local catalog fallback:", err);
  }

  // Fallback search inside local mock catalog
  const q = query.toLowerCase().trim();
  if (type === "movie") {
    const filtered = MOCK_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.original_title.toLowerCase().includes(q) ||
        (m.overview && m.overview.toLowerCase().includes(q)),
    );
    return {
      page: 1,
      total_pages: 1,
      total_results: filtered.length,
      results: filtered,
    };
  } else {
    const filtered = MOCK_TV_SHOWS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.original_name.toLowerCase().includes(q) ||
        (t.overview && t.overview.toLowerCase().includes(q)),
    );
    return {
      page: 1,
      total_pages: 1,
      total_results: filtered.length,
      results: filtered,
    };
  }
};

const SearchList = () => {
  const { content } = useDiscoverFilters();
  const searchParams = useSearchParams();
  const initialUrlQuery = searchParams.get("q") || "";
  const { ref, inViewport } = useInViewport();
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState(initialUrlQuery);
  const triggered = !isEmpty(submittedSearchQuery);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== submittedSearchQuery) {
      setSubmittedSearchQuery(q.trim());
    }
  }, [searchParams]);

  const { data, isFetching, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      enabled: triggered,
      queryKey: ["search-list", content, submittedSearchQuery],
      queryFn: ({ pageParam: page }) =>
        fetchData({ page, type: content, query: submittedSearchQuery }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport) {
      fetchNextPage();
    }
  }, [inViewport]);

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["search-list"] });
  }, [content]);

  const renderSearchResults = useMemo(() => {
    return () => {
      if (isEmpty(data?.pages[0].results)) {
        return (
          <h5 className="mt-56 text-center text-xl">
            No {content === "movie" ? "movies" : "TV series"} found with query{" "}
            <span className="text-warning font-semibold">"{submittedSearchQuery}"</span>
          </h5>
        );
      }

      return (
        <>
          <h5 className="text-center text-xl">
            <span className="motion-preset-focus">
              Found{" "}
              <span className="text-success font-semibold">{data?.pages[0].total_results}</span>{" "}
              {content === "movie" ? "movies" : "TV series"} with query{" "}
              <span className="text-warning font-semibold">"{submittedSearchQuery}"</span>
            </span>
          </h5>
          <div className="movie-grid">
            {content === "movie"
              ? data?.pages.map((page) =>
                  page.results.map((movie) => (
                    <MoviePosterCard key={movie.id} movie={movie as Movie} variant="bordered" />
                  )),
                )
              : data?.pages.map((page) =>
                  page.results.map((tv) => (
                    <TvShowHomeCard key={tv.id} tv={tv as TV} variant="bordered" />
                  )),
                )}
          </div>
        </>
      );
    };
  }, [content, data?.pages, submittedSearchQuery]);

  return (
    <div className="flex flex-col items-center gap-8 pb-16">
      <SearchFilter
        isLoading={isFetching}
        onSearchSubmit={(value) => setSubmittedSearchQuery(value.trim())}
      />
      {triggered ? (
        <>
          <div className="relative flex flex-col items-center gap-8 w-full max-w-7xl px-4 md:px-8">
            {isPending ? (
              <Spinner
                size="lg"
                className="absolute-center mt-32"
                color="danger"
                variant="simple"
              />
            ) : (
              renderSearchResults()
            )}
          </div>
          <div ref={ref} className="flex h-24 items-center justify-center">
            {isFetchingNextPage && (
              <Spinner
                color="danger"
                size="lg"
                variant="wave"
                label={getLoadingLabel()}
              />
            )}
            {!isEmpty(data?.pages[0].results) && !hasNextPage && !isPending && (
              <p className="text-muted-foreground text-center text-base">
                You have reached the end of the list.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-7xl px-4 md:px-8 mt-2">
          <div className="flex items-center gap-2 self-start">
            <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block" />
            <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">
              Popular on SnapFlix
            </h3>
          </div>
          <div className="movie-grid w-full">
            {content === "movie"
              ? MOCK_MOVIES.map((movie) => (
                  <MoviePosterCard key={movie.id} movie={movie as Movie} variant="bordered" />
                ))
              : MOCK_TV_SHOWS.map((tv) => (
                  <TvShowHomeCard key={tv.id} tv={tv as TV} variant="bordered" />
                ))}
          </div>
        </div>
      )}

      <BackToTopButton />
    </div>
  );
};

export default SearchList;
