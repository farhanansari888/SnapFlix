"use client";

import BookmarkButton from "@/components/ui/button/BookmarkButton";
import ShareButton from "@/components/ui/button/ShareButton";
import Trailer from "@/components/ui/overlay/Trailer";
import { SavedMovieDetails } from "@/types/movie";
import { getImageUrl, movieDurationString, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";
import { IoListOutline } from "react-icons/io5";

interface DetailHeroBillboardProps {
  media: any;
  type: "movie" | "tv";
  onViewEpisodesClick?: () => void;
}

const DetailHeroBillboard: React.FC<DetailHeroBillboardProps> = ({
  media,
  type,
  onViewEpisodesClick,
}) => {
  const isTv = type === "tv";
  const title = isTv ? mutateTvShowTitle(media) : mutateMovieTitle(media);
  const releaseDate = media.release_date || media.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 2025;
  const playHref = isTv ? `/watch/tv/${media.id}/1/1` : `/watch/movie/${media.id}`;
  const bgUrl = getImageUrl(media.backdrop_path || media.images?.backdrops?.[0]?.file_path, "backdrop", true);

  const voteAverage = media.vote_average || 8.2;
  const matchPercentage = Math.min(99, Math.round(voteAverage * 10 + 8));

  const bookmarkData: SavedMovieDetails = {
    type: isTv ? "tv" : "movie",
    adult: media.adult || false,
    backdrop_path: media.backdrop_path,
    id: media.id,
    poster_path: media.poster_path,
    release_date: releaseDate || "",
    title,
    vote_average: media.vote_average,
    saved_date: new Date().toISOString(),
  };

  const runtimeText = !isTv && media.runtime ? movieDurationString(media.runtime) : null;
  const seasonsText = isTv && media.number_of_seasons ? `${media.number_of_seasons} Season${media.number_of_seasons > 1 ? "s" : ""}` : null;
  const videos = media.videos?.results || [];

  return (
    <div className="group relative h-[60dvh] min-h-[400px] max-h-[520px] sm:h-[68dvh] sm:min-h-[480px] sm:max-h-[620px] lg:h-[80dvh] lg:min-h-[540px] lg:max-h-[800px] 2xl:h-[78dvh] w-full select-none overflow-hidden bg-[#0c0c0e]">
      {/* Background Backdrop: Edge-to-Edge Cinematic Brilliance */}
      <img
        src={bgUrl}
        alt=""
        width={1280}
        height={720}
        fetchPriority="high"
        className="hero-ken absolute inset-0 size-full object-cover object-center sm:object-top brightness-105 contrast-[1.04] saturate-[1.08] pointer-events-none"
        draggable={false}
      />

      {/* Cinematic Vignette Gradients */}
      {/* Bottom smooth fade to content section */}
      <div className="absolute inset-x-0 bottom-0 h-36 sm:h-52 md:h-64 bg-linear-to-t from-[#0c0c0e] via-[#0c0c0e]/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 hidden w-3/5 bg-linear-to-r from-[#0c0c0e]/80 via-[#0c0c0e]/30 to-transparent pointer-events-none z-10 md:block" />
      {/* Top subtle navbar blend */}
      <div className="absolute top-0 inset-x-0 h-14 bg-linear-to-b from-black/20 to-transparent pointer-events-none z-10" />

      {/* Hero Content Block */}
      <div className="sf-glass sf-glass-mobile absolute right-3 bottom-4 left-3 z-20 flex max-w-none flex-col gap-2 p-3.5 sm:right-4 sm:bottom-8 sm:left-4 sm:p-4 md:right-auto md:bottom-16 md:left-12 md:max-w-xl md:gap-3 md:p-0 lg:bottom-20 lg:max-w-2xl">
        {/* Netflix Brand Tagline / Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center justify-center h-4 w-3.5 sm:h-5 sm:w-4 rounded-xs bg-linear-to-b from-[#E50914] to-[#B81D24] shadow-xs">
            <span className="text-[9px] sm:text-[11px] font-black text-white">S</span>
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm font-extrabold tracking-[0.18em] sm:tracking-[0.22em] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isTv ? "SNAPFLIX ORIGINAL SERIES" : "SNAPFLIX FEATURE FILM"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] line-clamp-2 leading-tight">
          {title}
        </h1>

        {/* Tagline if available */}
        {media.tagline && (
          <p className="text-xs sm:text-sm font-semibold italic text-gray-300 drop-shadow-sm line-clamp-1">
            &ldquo;{media.tagline}&rdquo;
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[11px] sm:text-xs md:text-sm">
          <span className="font-extrabold text-[#46D369] drop-shadow-sm">
            {matchPercentage}% Match
          </span>
          <span className="text-gray-300 font-medium">{releaseYear}</span>
          <span className="border border-white/40 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold text-white uppercase">
            {media.adult ? "18+" : "16+"}
          </span>
          {runtimeText && (
            <span className="border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
              {runtimeText}
            </span>
          )}
          {seasonsText && (
            <span className="border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
              {seasonsText}
            </span>
          )}
          <span className="hidden sm:inline-block border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
            4K Ultra HD
          </span>
          <span className="hidden md:inline-block border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
            5.1 Audio
          </span>
        </div>

        {/* Genres Pills */}
        {media.genres && media.genres.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1.5 pt-0.5">
            {media.genres.slice(0, 4).map((g: any) => (
              <span
                key={g.id}
                className="text-[11px] text-gray-200 font-medium bg-black/50 px-2.5 py-0.5 rounded-full border border-white/10"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {/* Overview / Synopsis */}
        <p className="line-clamp-2 max-w-lg text-xs leading-relaxed text-gray-200/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:line-clamp-3 sm:text-sm md:text-base">
          {media.overview || "Stream this title now exclusively on SnapFlix."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
          {/* Main Play Button */}
          <Link
            href={playHref}
            className="group/btn flex min-h-11 items-center gap-1.5 sm:gap-2.5 rounded-full bg-white px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:bg-[#f4f4f4] active:scale-95"
          >
            <FaPlay className="text-xs sm:text-sm md:text-base transition-transform group-hover/btn:scale-110" />
            <span>Play</span>
          </Link>

          {/* Episodes Jump Button (For TV Series) */}
          {isTv && onViewEpisodesClick && (
            <button
              type="button"
              onClick={onViewEpisodesClick}
              className="sf-chip flex min-h-11 items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white transition-all duration-200 hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              <IoListOutline size={18} className="sm:size-[20px]" />
              <span>Episodes</span>
            </button>
          )}

          {/* Trailer Modal Button */}
          {videos.length > 0 && (
            <div className="scale-95 sm:scale-100">
              <Trailer videos={videos} />
            </div>
          )}

          {/* Bookmark / My List */}
          <div className="scale-95 sm:scale-105">
            <BookmarkButton data={bookmarkData} />
          </div>

          {/* Share Modal Button */}
          <div className="scale-95 sm:scale-100">
            <ShareButton id={media.id} title={title} type={type} />
          </div>
        </div>
      </div>

      {/* Bottom Right: Maturity Rating Pill */}
      <div className="sf-chip absolute right-12 bottom-20 z-30 hidden items-center rounded-full border-l-[3px] border-l-[#E50914] py-1.5 pr-4 pl-3 text-[11px] font-bold tracking-[0.16em] text-gray-200 uppercase lg:flex">
        {media.adult ? "TV-MA / 18+" : "TV-14 / 16+"}
      </div>
    </div>
  );
};

export default DetailHeroBillboard;
