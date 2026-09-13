"use client";

import { User } from "@heroui/react";
import { Cast } from "tmdb-ts";
import { getImageUrl } from "@/utils/movies";
import Carousel from "@/components/ui/wrapper/Carousel";
import SectionTitle from "@/components/ui/other/SectionTitle";

interface CastCardProps {
  casts: Cast[];
}

const CastsSection: React.FC<CastCardProps> = ({ casts }) => {
  return (
    <section id="casts" className="z-3 flex flex-col gap-2">
      <SectionTitle>Top Casts</SectionTitle>
      <Carousel classNames={{ container: "gap-5" }}>
        {casts.map((cast, index) => {
          const avatar = getImageUrl(cast.profile_path, "avatar");
          return (
            <div key={index} className="flex max-w-fit items-center px-1 py-2">
              <User
                name={cast.name}
                description={cast.character}
                avatarProps={{
                  src: avatar,
                  size: "lg",
                  showFallback: true,
                  isBordered: true,
                }}
              />
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default CastsSection;
