import DetailFacts, { languageLabel } from "@/components/sections/Detail/DetailFacts";

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

const MovieFacts: React.FC<MovieFactsProps> = ({ movie }) => {
  const crew = movie.credits?.crew || [];
  const director = crew.find((person) => person.job === "Director")?.name;
  const writers = crew
    .filter((person) => person.job === "Screenplay" || person.job === "Writer")
    .map((person) => person.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return (
    <DetailFacts
      overview={movie.overview}
      tagline={movie.tagline}
      facts={[
        ["Director", director],
        ["Writers", writers],
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
