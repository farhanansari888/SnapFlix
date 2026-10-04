interface CrewMember {
  name?: string;
  job?: string;
}

interface MovieFactsProps {
  movie: {
    overview?: string;
    tagline?: string;
    status?: string;
    original_language?: string;
    genres?: { id: number; name: string }[];
    credits?: { crew?: CrewMember[] };
    production_companies?: { id: number; name: string }[];
  };
}

const languageNames: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
};

const MovieFacts: React.FC<MovieFactsProps> = ({ movie }) => {
  const crew = movie.credits?.crew || [];
  const director = crew.find((person) => person.job === "Director")?.name;
  const writers = crew
    .filter((person) => person.job === "Screenplay" || person.job === "Writer")
    .map((person) => person.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const genres = movie.genres?.map((genre) => genre.name).join(", ");
  const studios = movie.production_companies
    ?.slice(0, 2)
    .map((company) => company.name)
    .join(", ");
  const language = movie.original_language
    ? languageNames[movie.original_language] || movie.original_language.toUpperCase()
    : null;

  const facts = [
    ["Director", director],
    ["Writers", writers],
    ["Genres", genres],
    ["Studio", studios],
    ["Language", language],
    ["Status", movie.status],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  if (!movie.overview && !movie.tagline && facts.length === 0) return null;

  return (
    <section className="px-4 md:px-12">
      <div className="max-w-3xl">
        {movie.tagline && (
          <p className="mb-2 text-sm text-white/50 italic">&ldquo;{movie.tagline}&rdquo;</p>
        )}
        {movie.overview && (
          <p className="text-sm leading-relaxed text-white/80 sm:text-base">{movie.overview}</p>
        )}
        {facts.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold tracking-wide text-white/40 uppercase">{label}</dt>
                <dd className="mt-1 text-sm text-white/90">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
};

export default MovieFacts;
