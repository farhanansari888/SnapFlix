import SectionTitle from "@/components/ui/other/SectionTitle";
import { isEmpty } from "@/utils/helpers";
import { Tab, Tabs } from "@heroui/react";
import { AppendToResponse, TV, TvShowDetails } from "tmdb-ts/dist/types";
import TvShowRelatedList from "./RelatedList";

interface TvShowRelatedSectionProps {
  tv: AppendToResponse<TvShowDetails, ("recommendations" | "similar")[], "tvShow">;
}

const TvShowRelatedSection: React.FC<TvShowRelatedSectionProps> = ({ tv }) => {
  // @ts-expect-error: wrong type.
  const recommendations = tv.recommendations.results as TV[];
  const similar = tv.similar.results as TV[];

  return (
    <section id="related" className="z-3">
      <SectionTitle color="warning" className="mb-2 sm:mb-0 sm:translate-y-10">
        You may like
      </SectionTitle>
      <Tabs
        aria-label="Related Section"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: "bg-warning h-1 rounded-full" }}
      >
        {!isEmpty(recommendations) && (
          <Tab key="recommendations" title="Recommendations">
            <TvShowRelatedList tvs={recommendations} />
          </Tab>
        )}
        {!isEmpty(similar) && (
          <Tab key="similar" title="Similar">
            <TvShowRelatedList tvs={similar} />
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default TvShowRelatedSection;
