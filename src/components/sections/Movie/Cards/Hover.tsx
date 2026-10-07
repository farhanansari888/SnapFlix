import { tmdb } from "@/api/tmdb";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import Genres from "@/components/ui/other/Genres";
import Rating from "@/components/ui/other/Rating";
import { SavedMovieDetails } from "@/types/movie";
import { cn, isEmpty } from "@/utils/helpers";
import { Calendar, Clock } from "@/utils/icons";
import { getImageUrl, movieDurationString, mutateMovieTitle } from "@/utils/movies";
import { Button, Image, Link, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Genre } from "tmdb-ts";

const HoverPosterCard: React.FC<{ id: number; fullWidth?: boolean }> = ({ id, fullWidth }) => {
  const { data: movie, isPending } = useQuery({
    queryFn: () => tmdb.movies.details(id, ["images"]),
    queryKey: ["get-movie-detail-on-hover-poster", id],
  });

  if (isPending) {
    return (
      <div
        className={cn("sf-glass-strong grid h-96 w-80 place-items-center rounded-[1.4rem]", {
          "w-full": fullWidth,
        })}
      >
        <Spinner size="lg" variant="simple" />
      </div>
    );
  }

  if (!movie) return null;

  const title = mutateMovieTitle(movie);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
  const fullTitle = title;
  const backdropImage = getImageUrl(movie.backdrop_path, "backdrop");
  const titleImage = getImageUrl(
    movie.images.logos.find((logo) => logo.iso_639_1 === "en")?.file_path,
    "title",
  );
  const matchPercentage = Math.min(99, Math.round((movie.vote_average || 7.5) * 10 + 8));
  const bookmarkData: SavedMovieDetails = {
    type: "movie",
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    id: movie.id,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: fullTitle,
    vote_average: movie.vote_average,
    saved_date: new Date().toISOString(),
  };

  return (
    <div
      className={cn(
        "sf-glass-strong w-80 overflow-hidden rounded-[1.4rem] text-white",
        { "w-full": fullWidth },
      )}
    >
      <div className="relative">
        <div className="absolute aspect-video h-fit w-full">
          <div className="absolute z-2 h-full w-full bg-linear-to-t from-[#0b0b0e] from-1%"></div>
          {!isEmpty(titleImage) && (
            <Image
              isBlurred
              radius="none"
              alt={fullTitle}
              classNames={{ wrapper: "absolute-center z-1 bg-transparent" }}
              className="h-full max-h-32 w-full drop-shadow-xl"
              src={titleImage}
            />
          )}
          <Image
            radius="none"
            alt={fullTitle}
            className="z-0 aspect-video w-full object-cover object-center"
            src={backdropImage}
          />
        </div>
        <div className="relative flex flex-col gap-2 p-4 pt-[40%]">
          <div className="flex items-center gap-2">
            <span className="sf-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#E50914]" />
              Movie
            </span>
            {movie.adult && (
              <span className="rounded-full border border-[#E50914]/50 bg-[#E50914]/20 px-2 py-0.5 text-[11px] font-bold text-white">
                18+
              </span>
            )}
          </div>
          <h4 className="line-clamp-2 text-xl leading-tight font-black tracking-tight text-white">
            {fullTitle}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-[#46d369]">{matchPercentage}% Match</span>
            <div className="flex items-center gap-1 text-white/75">
              <Clock />
              <span>{movieDurationString(movie.runtime)}</span>
            </div>
            <p className="text-white/35">&#8226;</p>
            <div className="flex items-center gap-1 text-white/75">
              <Calendar />
              <span>{releaseYear}</span>
            </div>
            <p className="text-white/35">&#8226;</p>
            <Rating rate={movie.vote_average || 0} />
          </div>
          <Genres
            genres={movie.genres as Genre[]}
            chipProps={{
              size: "sm",
              variant: "flat",
              radius: "full",
              className: "sf-chip text-white/85!",
            }}
          />
          <div className="flex w-full justify-between gap-2 py-1">
            <Button
              as={Link}
              href={`/watch/movie/${movie.id}`}
              fullWidth
              color="primary"
              variant="shadow"
              startContent={<Icon icon="solar:play-circle-bold" fontSize={24} />}
            >
              Play Now
            </Button>
            <BookmarkButton data={bookmarkData} isTooltipDisabled />
          </div>
          <p className="line-clamp-5 text-sm text-white/80">{movie.overview}</p>
        </div>
      </div>
    </div>
  );
};

export default HoverPosterCard;
