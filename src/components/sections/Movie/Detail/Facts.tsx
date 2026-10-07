import DetailFacts, { languageLabel } from "@/components/sections/Detail/DetailFacts";
import Link from "next/link";

interface CrewMember {
  id?: number;
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

const PersonLink: React.FC<{ id?: number; name?: string }> = ({ id, name }) => {
  if (!name) return null;
  if (!id) return <>{name}</>;
  return (
    <Link href={`/person/${id}`} className="transition hover:text-white hover:underline">
      {name}
    </Link>
  );
};

const MovieFacts: React.FC<MovieFactsProps> = ({ movie }) => {
  const crew = movie.credits?.crew || [];
  const director = crew.find((person) => person.job === "Director");
  const writers = crew
    .filter((person) => person.job === "Screenplay" || person.job === "Writer")
    .filter((person) => Boolean(person.name))
    .slice(0, 3);

  return (
    <DetailFacts
      overview={movie.overview}
      tagline={movie.tagline}
      facts={[
        ["Director", director?.name ? <PersonLink id={director.id} name={director.name} /> : undefined],
        [
          "Writers",
          writers.length > 0 ? (
            <>
              {writers.map((writer, index) => (
                <span key={writer.id ?? writer.name}>
                  <PersonLink id={writer.id} name={writer.name} />
                  {index < writers.length - 1 ? ", " : ""}
                </span>
              ))}
            </>
          ) : undefined,
        ],
        ["Genres", movie.genres?.map((genre) => genre.name).join(", ")],
        [
          "Studio",
          movie.production_companies
            ?.slice(0, 2)
            .map((company) => company.name)
            .join(", "),
        ],
        ["Language", languageLabel(movie.original_language)],
        ["Status", movie.status],
      ]}
    />
  );
};

export default MovieFacts;
