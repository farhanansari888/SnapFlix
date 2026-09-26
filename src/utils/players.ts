import { PlayersProps } from "@/types";

/**
 * Generates a list of movie players with their respective titles and source URLs.
 * Uses Bingr Embed API (/watch/movie/{tmdbId}).
 *
 * @param {string | number} id - The TMDB ID of the movie to be embedded.
 * @param {number} [startAt] - The start position in seconds. Optional.
 * @returns {PlayersProps[]} - An array of objects with the player title and source URL.
 */
export const getMoviePlayers = (id: string | number, startAt?: number): PlayersProps[] => {
  return [
    {
      title: "Bingr",
      source: `https://bingr.one/watch/movie/${id}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
  ];
};

/**
 * Generates a list of TV show players with their respective titles and source URLs.
 * Uses Bingr Embed API (/watch/tv/{tmdbId}/{season}/{episode}).
 *
 * @param {string | number} id - The TMDB ID of the TV show.
 * @param {number} season - The season number.
 * @param {number} episode - The episode number.
 * @param {number} [startAt] - The start position in seconds. Optional.
 * @returns {PlayersProps[]} - An array of objects with the player title and source URL.
 */
export const getTvShowPlayers = (
  id: string | number,
  season: number,
  episode: number,
  startAt?: number,
): PlayersProps[] => {
  return [
    {
      title: "Bingr",
      source: `https://bingr.one/watch/tv/${id}/${season}/${episode}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
  ];
};

