import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl, mutateMovieTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { FaPlay } from "react-icons/fa6";
import { Movie } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import HoverPosterCard from "./Hover";

interface MoviePosterCardProps {
  movie: Movie;
  variant?: "full" | "bordered";
}

const MoviePosterCard: React.FC<MoviePosterCardProps> = ({ movie, variant = "full" }) => {
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = new Date(movie.release_date).getFullYear();
  const posterImage = getImageUrl(movie.poster_path);
  const title = mutateMovieTitle(movie);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={1000}
        placement="right-start"
        content={<HoverPosterCard id={movie.id} />}
      >
        <Link href={`/movie/${movie.id}`} {...longPress()} className="block">
          {variant === "full" && (
            <div className="poster-frame group motion-preset-focus aspect-2/3 h-[250px] text-white transition duration-300 hover:outline-[#E50914]/80 hover:shadow-[0_16px_36px_rgba(229,9,20,0.28)] md:h-[300px]">
              <Image
                alt={title}
                src={posterImage}
                radius="none"
                className="z-0 aspect-2/3 h-[250px] object-cover object-center transition duration-500 group-hover:scale-105 md:h-[300px]"
              />
              {movie.adult && (
                <Chip color="danger" size="sm" variant="flat" className="absolute left-2 top-2 z-20">
                  18+
                </Chip>
              )}
              <div className="absolute top-2 right-2 z-20 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-[#f5c451] backdrop-blur-md">
                <Rating rate={movie?.vote_average} />
              </div>
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-lg">
                  <FaPlay className="ml-0.5 text-sm" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black via-black/75 to-transparent px-3 pt-12 pb-3">
                <h6 className="truncate text-sm font-semibold">{title}</h6>
                <p className="text-[11px] text-white/70">{releaseYear || "—"}</p>
              </div>
            </div>
          )}

          {variant === "bordered" && (
            <Card
              isHoverable
              fullWidth
              shadow="md"
              className="group h-full border border-white/8 bg-secondary-background transition duration-300 hover:-translate-y-1 hover:border-[#E50914]/50"
            >
              <CardHeader className="flex items-center justify-center pb-0">
                <div className="relative size-full">
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="flex size-11 items-center justify-center rounded-full bg-white text-black shadow-lg">
                      <FaPlay className="ml-0.5 text-xs" />
                    </span>
                  </div>
                  {movie.adult && (
                    <Chip
                      color="danger"
                      size="sm"
                      variant="shadow"
                      className="absolute left-2 top-2 z-20"
                    >
                      18+
                    </Chip>
                  )}
                  <div className="relative overflow-hidden rounded-large">
                    <Image
                      isBlurred
                      alt={title}
                      className="aspect-2/3 rounded-lg object-cover object-center transition duration-500 group-hover:scale-105"
                      src={posterImage}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="text-md truncate font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs">
                <p>{releaseYear}</p>
                <Rating rate={movie.vote_average} />
              </CardFooter>
            </Card>
          )}
        </Link>
      </Tooltip>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          <HoverPosterCard id={movie.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};
export default MoviePosterCard;
