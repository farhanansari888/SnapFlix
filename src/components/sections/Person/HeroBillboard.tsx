"use client";

import { getImageUrl } from "@/utils/movies";
import { Image } from "@heroui/react";
import { differenceInYears } from "date-fns";
import { FaExternalLinkAlt } from "react-icons/fa";

interface PersonHeroBillboardProps {
  person: any;
}

const heroFrame =
  "relative h-[62dvh] min-h-[420px] max-h-[540px] w-full overflow-hidden bg-[#0c0c0e] sm:h-[70dvh] sm:min-h-[500px] sm:max-h-[680px] lg:h-[78dvh] lg:min-h-[560px] lg:max-h-[820px]";

/** Picks the highest profile backdrop amongst this person's best known credits. */
const pickBackdrop = (person: any): string | undefined => {
  const credits = [...(person?.combined_credits?.cast ?? []), ...(person?.combined_credits?.crew ?? [])];
  const withBackdrop = credits
    .filter((item) => Boolean(item?.backdrop_path))
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  return withBackdrop[0]?.backdrop_path;
};

const PersonHeroBillboard: React.FC<PersonHeroBillboardProps> = ({ person }) => {
  const backdropPath = pickBackdrop(person);
  const bgUrl = getImageUrl(backdropPath, "backdrop", true);
  const avatarUrl = person.profile_path ? getImageUrl(person.profile_path, "avatar") : "";

  const age =
    person.birthday && !person.deathday
      ? differenceInYears(new Date(), new Date(person.birthday))
      : person.birthday && person.deathday
        ? differenceInYears(new Date(person.deathday), new Date(person.birthday))
        : null;

  const imdbId = person.imdb_id || person.external_ids?.imdb_id;

  return (
    <div className={heroFrame}>
      {backdropPath ? (
        <img
          src={bgUrl}
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
          className="hero-ken pointer-events-none absolute inset-0 size-full object-cover object-[center_18%] opacity-60 blur-[1px] sm:object-top"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#161618] to-[#0c0c0e]" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[75%] bg-linear-to-t from-[#0c0c0e] via-[#0c0c0e]/85 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-1/2 bg-linear-to-r from-[#0c0c0e]/80 to-transparent md:block" />

      <div className="absolute inset-x-4 bottom-8 z-20 flex max-w-2xl items-end gap-4 sm:inset-x-8 sm:bottom-10 md:left-12 md:gap-6">
        <Image
          isBlurred
          radius="full"
          alt={person.name}
          src={avatarUrl}
          classNames={{
            wrapper: "size-24 shrink-0 ring-2 ring-white/20 sm:size-32 md:size-36",
          }}
          className="aspect-square size-24 object-cover object-top sm:size-32 md:size-36"
        />

        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-xs font-semibold text-white/80 sm:text-sm">
            {person.known_for_department || "Acting"}
          </p>

          <h1 className="line-clamp-2 text-2xl leading-[1.05] font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] sm:text-4xl lg:text-5xl">
            {person.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/75 sm:text-sm">
            {age !== null && (
              <span>
                {person.deathday ? `Died at ${age}` : `${age} years old`}
              </span>
            )}
            {person.place_of_birth && (
              <>
                {age !== null && <span className="text-white/35">·</span>}
                <span className="truncate">{person.place_of_birth}</span>
              </>
            )}
          </div>

          {imdbId && (
            <a
              href={`https://www.imdb.com/name/${imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sf-chip mt-1 inline-flex h-10 w-fit shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white transition hover:bg-white/15 active:scale-95 sm:text-sm"
            >
              <FaExternalLinkAlt className="size-3" />
              View on IMDb
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonHeroBillboard;
