"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import Carousel from "@/components/ui/wrapper/Carousel";
import CatalogErrorState from "@/components/ui/other/CatalogErrorState";
import PopcornTvLoader from "@/components/ui/other/PopcornTvLoader";
import RowHeader from "@/components/ui/other/RowHeader";
import { QueryList } from "@/types";
import { unwrapCatalog } from "@/utils/catalog";
import { useQuery } from "@tanstack/react-query";
import { useInViewport } from "@mantine/hooks";
import { kebabCase } from "string-ts";
import { Movie } from "tmdb-ts/dist/types";

const MovieHomeList: React.FC<QueryList<Movie>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryFn: async () => unwrapCatalog(await query()),
    queryKey: [key],
    enabled: inViewport,
  });

  const results = data?.results ?? [];

  return (
    <section id={key} className="min-h-[260px] md:min-h-[310px]" ref={ref}>
      <div className="z-3 flex flex-col gap-2">
        <RowHeader title={name} href={`/discover?type=${param}`} className="px-4 md:px-12" />

        {isPending && (
          <div className="flex min-h-[220px] items-center justify-center">
            <PopcornTvLoader size="md" label={`Fetching ${name.toLowerCase()}`} />
          </div>
        )}

        {!isPending && isError && (
          <div className="px-4 md:px-12">
            <CatalogErrorState
              compact
              error={error}
              isRetrying={isRefetching}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {!isPending && !isError && results.length > 0 && (
          <div className="px-4 md:px-12">
            <Carousel>
              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-3"
                >
                  <MoviePosterCard movie={movie} />
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieHomeList;
