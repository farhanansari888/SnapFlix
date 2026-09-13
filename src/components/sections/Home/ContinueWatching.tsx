"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import ResumeCard from "./Cards/Resume";
import { useQuery } from "@tanstack/react-query";
import { getUserHistories } from "@/actions/histories";

const ContinueWatching: React.FC = () => {
  const { data } = useQuery({
    queryFn: () => getUserHistories(),
    queryKey: ["continue-watching"],
  });

  if (!data?.data || data.data.length === 0) return null;

  return (
    <section id="continue-watching" className="flex flex-col gap-2 min-h-[220px] px-4 md:px-12">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white">
        Continue Watching
      </h2>
      <Carousel>
        {data.data.map((media) => (
          <div
            key={media.id}
            className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
          >
            <ResumeCard media={media} />
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default ContinueWatching;
