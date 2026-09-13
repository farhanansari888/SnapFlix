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
  const playHref = isTv ? `/tv/${media.id}/1/1/player` : `/movie/${media.id}/player`;
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
    <div className="group relative h-screen min-h-[580px] w-full select-none overflow-hidden bg-[#141414]">
      {/* Background Backdrop: Edge-to-Edge Cinematic Brilliance */}
      <img
        src={bgUrl}
        alt={title}
        className="absolute inset-0 size-full object-cover object-center sm:object-top filter brightness-100 contrast-[1.03] saturate-[1.05] pointer-events-none"
        draggable={false}
      />

      {/* Cinematic Vignette Gradients */}
      {/* Bottom smooth fade to content section */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-[#141414] via-[#141414]/50 to-transparent pointer-events-none z-10" />
      {/* Left subtle vignette only behind text */}
      <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 md:w-3/5 bg-linear-to-r from-[#141414]/85 via-[#141414]/35 via-50% to-transparent pointer-events-none z-10" />
      {/* Top subtle navbar blend */}
      <div className="absolute top-0 inset-x-0 h-14 bg-linear-to-b from-black/15 to-transparent pointer-events-none z-10" />

      {/* Hero Content Block (Balanced Lower-Third Positioning) */}
      <div className="absolute bottom-14 sm:bottom-18 md:bottom-22 lg:bottom-24 left-4 md:left-12 max-w-xl lg:max-w-2xl flex flex-col gap-2.5 md:gap-3 z-20">
        {/* Netflix Brand Tagline / Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-5 w-4 rounded-xs bg-linear-to-b from-[#E50914] to-[#B81D24] shadow-xs">
            <span className="text-[11px] font-black text-white">S</span>
          </div>
          <span className="text-xs md:text-sm font-extrabold tracking-[0.22em] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isTv ? "SNAPFLIX ORIGINAL SERIES" : "SNAPFLIX FEATURE FILM"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] line-clamp-2 leading-none">
          {title}
        </h1>

        {/* Tagline if available */}
        {media.tagline && (
          <p className="text-xs sm:text-sm font-semibold italic text-gray-300 drop-shadow-sm line-clamp-1">
            &ldquo;{media.tagline}&rdquo;
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
          <span className="font-extrabold text-[#46D369] drop-shadow-sm">
            {matchPercentage}% Match
          </span>
          <span className="text-gray-300 font-medium">{releaseYear}</span>
          <span className="border border-white/40 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-white uppercase">
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
          <span className="border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
            4K Ultra HD
          </span>
          <span className="border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
            5.1 Audio
          </span>
        </div>

        {/* Genres Pills */}
        {media.genres && media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
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
        <p className="text-sm md:text-base text-gray-200/90 leading-relaxed line-clamp-3 max-w-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {media.overview || "Stream this title now exclusively on SnapFlix."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Main Play Button */}
          <Link
            href={playHref}
            className="group/btn flex items-center gap-2.5 rounded-md bg-white px-6 py-2.5 md:py-3 text-sm md:text-base font-bold text-black shadow-lg transition-all duration-200 hover:bg-white/80 active:scale-95"
          >
            <FaPlay className="text-sm md:text-base transition-transform group-hover/btn:scale-110" />
            <span>Play</span>
          </Link>

          {/* Episodes Jump Button (For TV Series) */}
          {isTv && onViewEpisodesClick && (
            <button
              type="button"
              onClick={onViewEpisodesClick}
              className="flex items-center gap-2 rounded-md bg-white/20 backdrop-blur-md px-5 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white transition-all duration-200 hover:bg-white/30 active:scale-95 border border-white/15 cursor-pointer"
            >
              <IoListOutline size={20} />
              <span>Episodes</span>
            </button>
          )}

          {/* Trailer Modal Button */}
          {videos.length > 0 && (
            <div className="scale-100">
              <Trailer videos={videos} />
            </div>
          )}

          {/* Bookmark / My List */}
          <div className="scale-105">
            <BookmarkButton data={bookmarkData} />
          </div>

          {/* Share Modal Button */}
          <div className="scale-100">
            <ShareButton id={media.id} title={title} type={type} />
          </div>
        </div>
      </div>

      {/* Bottom Right: Maturity Rating Pill */}
      <div className="absolute right-4 md:right-12 bottom-14 sm:bottom-18 md:bottom-22 lg:bottom-24 hidden sm:flex items-center bg-[#141414]/70 border-l-3 border-[#E50914] py-1.5 pl-3 pr-4 backdrop-blur-xs text-xs font-bold text-gray-200 uppercase tracking-wider z-30">
        {media.adult ? "TV-MA / 18+" : "TV-14 / 16+"}
      </div>
    </div>
  );
};

export default DetailHeroBillboard;
