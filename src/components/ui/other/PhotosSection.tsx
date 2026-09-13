import { Image as ImageProps } from "tmdb-ts";
import { Image } from "@heroui/react";
import { getImageUrl } from "@/utils/movies";
import Gallery from "@/components/ui/overlay/Gallery";
import { Slide } from "yet-another-react-lightbox";
import { useState } from "react";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { Eye } from "@/utils/icons";

interface PhotosSectionProps {
  images: ImageProps[];
  type?: "movie" | "tv";
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ images, type = "movie" }) => {
  const [index, setIndex] = useState<number>(-1);
  const slides: Slide[] = images.map(({ file_path, width, height }) => ({
    src: getImageUrl(file_path, "backdrop", true),
    description: `${width}x${height}`,
  }));

  return (
    <section id="gallery" className="z-3 flex flex-col gap-2">
      <SectionTitle color={type === "movie" ? "primary" : "warning"}>Photos</SectionTitle>
      <div className="grid grid-cols-2 place-items-center gap-3 sm:grid-cols-4">
        {images.slice(0, 4).map(({ file_path }, index) => (
          <div key={file_path} className="group relative">
            <Image
              onClick={() => setIndex(index)}
              isBlurred
              isZoomed
              width={300}
              alt={`Image ${index + 1}`}
              src={getImageUrl(file_path, "backdrop")}
              className="aspect-video cursor-pointer"
            />

            {index === 3 && images.length > 4 ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-medium bg-black/40 text-xl font-bold text-white backdrop-blur-xs"
                onClick={() => setIndex(index)}
              >
                +{images.length - 4}
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Gallery open={index >= 0} index={index} close={() => setIndex(-1)} slides={slides} />
    </section>
  );
};

export default PhotosSection;
