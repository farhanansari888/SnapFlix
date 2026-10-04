import DetailFacts, { languageLabel } from "@/components/sections/Detail/DetailFacts";

interface SeriesFactsProps {
  show: {
    overview?: string;
    tagline?: string;
    status?: string;
    original_language?: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
    genres?: { id: number; name: string }[];
    created_by?: { name?: string }[];
    networks?: { name?: string }[];
    production_companies?: { name?: string }[];
  };
}

const SeriesFacts: React.FC<SeriesFactsProps> = ({ show }) => {
  const creators = show.created_by
    ?.map((person) => person.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const seasons =
    show.number_of_seasons && show.number_of_episodes
      ? `${show.number_of_seasons} season${show.number_of_seasons > 1 ? "s" : ""} · ${show.number_of_episodes} episodes`
      : show.number_of_seasons
        ? `${show.number_of_seasons} season${show.number_of_seasons > 1 ? "s" : ""}`
        : null;

  return (
    <DetailFacts
      overview={show.overview}
      tagline={show.tagline}
      facts={[
        ["Creators", creators],
        ["Genres", show.genres?.map((genre) => genre.name).join(", ")],
        ["Seasons", seasons],
        ["Network", show.networks?.slice(0, 2).map((network) => network.name).join(", ")],
        [
          "Studio",
          show.production_companies
            ?.slice(0, 2)
            .map((company) => company.name)
            .join(", "),
        ],
        ["Language", languageLabel(show.original_language)],
        ["Status", show.status],
      ]}
    />
  );
};

export default SeriesFacts;
