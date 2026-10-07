"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import ResumeCard from "./Cards/Resume";
import RowHeader from "@/components/ui/other/RowHeader";
import { useWatchHistory } from "@/hooks/useWatchHistory";

const ContinueWatching: React.FC = () => {
  const { data: list } = useWatchHistory();

  if (!list || list.length === 0) return null;

  return (
    <section id="continue-watching" className="flex flex-col gap-2 min-h-[220px] px-4 md:px-12">
      <RowHeader title="Continue watching" />
      <Carousel>
        {list.map((media) => (
          <div
            key={`${media.type}_${media.media_id}_${media.season}_${media.episode}`}
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
