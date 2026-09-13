"use client";

import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import Carousel from "@/components/ui/wrapper/Carousel";
import { QueryList } from "@/types";
import { MOCK_TV_SHOWS } from "@/utils/mockData";
import { Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { kebabCase } from "string-ts";
import { TV } from "tmdb-ts/dist/types";

const TvShowHomeList: React.FC<QueryList<TV>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: async () => {
      try {
        const res = await query();
        if (res?.results?.length > 0) return res;
      } catch (err) {
        console.warn(`Query failed for ${name}, using fallback:`, err);
      }
      return {
        page: 1,
        results: MOCK_TV_SHOWS,
        total_pages: 1,
        total_results: MOCK_TV_SHOWS.length,
      };
    },
    queryKey: [key],
    enabled: inViewport,
  });

  const results = data?.results && data.results.length > 0 ? data.results : MOCK_TV_SHOWS;

  return (
    <section id={key} className="min-h-[260px] md:min-h-[310px]" ref={ref}>
      {isPending && results.length === 0 ? (
        <div className="flex w-full flex-col gap-4 px-4 md:px-12">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-6 w-44 rounded-sm opacity-20" />
            <Skeleton className="h-4 w-16 rounded-sm opacity-20" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[240px] w-[160px] shrink-0 rounded-md opacity-25" />
            ))}
          </div>
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between px-4 md:px-12">
            <Link
              href={`/discover?type=${param}&content=tv`}
              className="group flex items-center gap-2"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white group-hover:text-gray-200 transition-colors">
                {name}
              </h2>
              <span className="text-xs font-bold text-[#E50914] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Explore All &gt;
              </span>
            </Link>
            <Link
              href={`/discover?type=${param}&content=tv`}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              See All &gt;
            </Link>
          </div>
          <div className="px-4 md:px-12">
            <Carousel>
              {results.map((tv) => (
                <div
                  key={tv.id}
                  className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-3"
                >
                  <TvShowHomeCard tv={tv} />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}
    </section>
  );
};

export default TvShowHomeList;
