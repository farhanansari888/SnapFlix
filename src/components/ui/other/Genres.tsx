import { ContentType } from "@/types";
import { Chip, Link, ChipProps } from "@heroui/react";
import { Genre } from "tmdb-ts";

export interface GenresProps {
  genres: Genre[];
  type?: ContentType;
  chipProps?: Omit<ChipProps, "children" | "as" | "href" | "key">;
}

const Genres: React.FC<GenresProps> = ({
  genres,
  type = "movie",
  chipProps = {
    size: "sm",
    variant: "flat",
    radius: "full",
  },
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map(({ id, name }) => (
        <Chip as={Link} href={`/discover?genres=${id}&content=${type}`} key={id} {...chipProps}>
          {name}
        </Chip>
      ))}
    </div>
  );
};

export default Genres;
