"use client";

import { AppendToResponse, Movie, MovieDetails } from "tmdb-ts/dist/types";
import { Tab, Tabs } from "@heroui/tabs";
import RelatedMovieList from "./RelatedList";
import SectionTitle from "@/components/ui/other/SectionTitle";

const RelatedSection: React.FC<{
  movie: AppendToResponse<MovieDetails, ("recommendations" | "similar")[], "movie">;
}> = ({ movie }) => {
  const recommendations = movie.recommendations.results as Movie[];
  const similar = movie.similar.results as Movie[];

  return (
    <section id="related" className="z-3">
      <SectionTitle className="mb-2 sm:mb-0 sm:translate-y-10">You may like</SectionTitle>
      <Tabs
        aria-label="Related Section"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: "bg-primary h-1 rounded-full" }}
      >
        {recommendations.length > 0 && (
          <Tab key="recommendations" title="Recommendations">
            <RelatedMovieList movies={recommendations} />
          </Tab>
        )}
        {similar.length > 0 && (
          <Tab key="similar" title="Similar">
            <RelatedMovieList movies={similar} />
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default RelatedSection;
