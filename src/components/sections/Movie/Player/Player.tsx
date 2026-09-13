import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const players = getMoviePlayers(movie.id, startAt);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  usePlayerEvents({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  return (
    <>
      <AdsWarning />

      <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-black">
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <div className="relative h-full w-full overflow-hidden bg-black">
          <Skeleton className="absolute inset-0 h-full w-full" />
          <iframe
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            key={PLAYER.title}
            src={PLAYER.source}
            className={cn("absolute inset-0 z-10 h-full w-full border-0", { "pointer-events-none": idle && !mobile })}
          />
        </div>
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
