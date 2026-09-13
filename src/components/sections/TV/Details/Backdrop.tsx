import { Image } from "@heroui/image";
import { useWindowScroll } from "@mantine/hooks";
import { AppendToResponse } from "tmdb-ts/dist/types/options";
import { getImageUrl, mutateTvShowTitle } from "@/utils/movies";
import { TvShowDetails } from "tmdb-ts";
import { isEmpty } from "@/utils/helpers";

const TvShowBackdropSection: React.FC<{
  tv: AppendToResponse<TvShowDetails, "images"[], "movie">;
}> = ({ tv }) => {
  const [{ y }] = useWindowScroll();
  const title = mutateTvShowTitle(tv);
  const opacity = Math.min((y / 1000) * 2, 1);
  const backdropImage = getImageUrl(tv.backdrop_path, "backdrop", true);
  const titleImage = getImageUrl(
    tv.images.logos.find((logo) => logo.iso_639_1 === "en")?.file_path,
    "title",
  );

  return (
    <section id="backdrop" className="fixed inset-0 h-[35vh] md:h-[50vh] lg:h-[70vh]">
      <div className="absolute inset-0 z-10 bg-background" style={{ opacity: opacity }} />
      <div className="absolute inset-0 z-2 bg-linear-to-b from-background from-1% via-transparent via-30%" />
      <div className="absolute inset-0 z-2 translate-y-px bg-linear-to-t from-background from-1% via-transparent via-55%" />
      {!isEmpty(titleImage) && (
        <Image
          isBlurred
          radius="none"
          alt={title}
          classNames={{ wrapper: "absolute-center z-1 bg-transparent" }}
          className="w-[25vh] max-w-80 drop-shadow-xl md:w-[60vh]"
          src={titleImage}
        />
      )}
      <Image
        radius="none"
        alt={title}
        className="z-0 h-[35vh] w-screen object-cover object-center md:h-[50vh] lg:h-[70vh]"
        src={backdropImage}
      />
    </section>
  );
};

export default TvShowBackdropSection;
