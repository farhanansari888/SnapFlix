import { Movie } from "tmdb-ts/dist/types";
import Carousel from "@/components/ui/wrapper/Carousel";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";

const RelatedMovieList: React.FC<{ movies: Movie[] }> = ({ movies }) => {
  return (
    <div className="z-3 flex flex-col gap-2">
      <Carousel>
        {movies.map((movie) => {
          return (
            <div key={movie.id} className="flex min-h-fit max-w-fit items-center px-1 py-2">
              <MoviePosterCard movie={movie} />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};

export default RelatedMovieList;
