"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { BebasNeue } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import { Skeleton, Tooltip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import RowHeader from "@/components/ui/other/RowHeader";
import { FaPlay } from "react-icons/fa6";
import HoverPosterCard from "../Movie/Cards/Hover";
import TvShowHoverCard from "../TV/Cards/Hover";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";

interface Top10RowProps {
  contentType?: "movie" | "tv";
}

const Top10Row: React.FC<Top10RowProps> = ({ contentType: propContentType }) => {
  const { content: filterContent } = useDiscoverFilters();
  const currentContent = filterContent || propContentType || "movie";
  const isTv = currentContent === "tv";
  const { mobile } = useBreakpoints();

  const { data, isPending } = useQuery({
    queryKey: ["top10-ranking", currentContent],
    queryFn: async () => {
      try {
        if (isTv) {
          const res = await tmdb.trending.trending("tv", "day");
          if (res?.results?.length > 0) return res;
        } else {
          const res = await tmdb.trending.trending("movie", "day");
          if (res?.results?.length > 0) return res;
        }
      } catch (err) {
        console.warn("TMDB error in Top 10, using fallback:", err);
      }
      return {
        results: isTv ? MOCK_TV_SHOWS.slice(0, 10) : MOCK_MOVIES.slice(0, 10),
      };
    },
    staleTime: 1000 * 60 * 30,
  });

  const top10 =
    data?.results && data.results.length > 0
      ? data.results.slice(0, 10)
      : isTv
        ? MOCK_TV_SHOWS.slice(0, 10)
        : MOCK_MOVIES.slice(0, 10);

  return (
    <section className="flex flex-col gap-2 min-h-[280px]">
      {/* Netflix Section Title */}
      <RowHeader
        accent="Top 10"
        title={isTv ? "series today" : "movies today"}
        href={`/discover?type=todayTrending${isTv ? "&content=tv" : ""}`}
        className="px-4 md:px-12"
      />

      {isPending && top10.length === 0 ? (
        <div className="flex gap-4 overflow-hidden px-4 md:px-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-44 w-20 rounded-md opacity-20" />
              <Skeleton className="h-48 w-32 rounded-lg opacity-30" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 md:px-12">
          <Carousel>
            {top10.map((item, index) => {
              const rank = index + 1;
              const title = isTv ? mutateTvShowTitle(item as any) : mutateMovieTitle(item as any);
              const posterUrl = getImageUrl(item.poster_path);
              const href = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;

              return (
                <div key={item.id} className="embla__slide flex min-w-fit items-center py-4 pr-4">
                  <Tooltip
                    isDisabled={mobile}
                    showArrow
                    className="bg-[#181818] border border-white/10 p-0"
                    shadow="lg"
                    delay={800}
                    placement="right-start"
                    content={
                      isTv ? (
                        <TvShowHoverCard id={item.id} />
                      ) : (
                        <HoverPosterCard id={item.id} />
                      )
                    }
                  >
                    <Link
                      href={href}
                      className="group relative flex items-end transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
                    >
                      {/* Netflix Stylized Giant Ranking Number */}
                      <span
                        className={cn(
                          "netflix-number pointer-events-none z-0 -mr-3 text-[76px] leading-none tracking-tighter select-none drop-shadow-xl sm:-mr-5 sm:text-[120px] md:text-[156px]",
                          BebasNeue.className,
                        )}
                        style={{
                          WebkitTextStroke: "3px #6a6a6a",
                          color: "#0c0c0e",
                        }}
                      >
                        {rank}
                      </span>

                      {/* Poster Card */}
                      <div className="relative z-10 aspect-2/3 h-[168px] w-auto overflow-hidden rounded-[1.05rem] border border-white/16 bg-[#161618] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_32px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:border-white/40 sm:h-[210px] md:h-[240px]">
                        {/* Netflix Red Top 10 Ribbon */}
                        <div className="absolute top-0 right-0 z-20 bg-[#E50914] text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-sm uppercase tracking-wider shadow-md">
                          TOP 10
                        </div>

                        {/* Hover Play Button */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <div className="flex size-11 items-center justify-center rounded-full bg-[#E50914] text-white shadow-lg transition-transform group-hover:scale-110">
                            <FaPlay className="ml-0.5 text-sm" />
                          </div>
                        </div>

                        {/* Vignette Bottom Gradient */}
                        <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-linear-to-t from-black/90 to-transparent pointer-events-none" />

                        {/* Title text */}
                        <div className="absolute inset-x-0 bottom-0 z-20 p-2.5">
                          <p className="text-xs font-bold text-white truncate drop-shadow-md">
                            {title}
                          </p>
                        </div>

                        {/* Poster Image */}
                        <img
                          src={posterUrl}
                          alt={title}
                          className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                  </Tooltip>
                </div>
              );
            })}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default Top10Row;
