import { getMovieList, getTrendingMovies, getTrendingTvShows, getTvList } from "@/actions/lists";
import { SiteConfigType } from "@/types";
import { BiSearchAlt2, BiSolidSearchAlt2 } from "react-icons/bi";
import { GoHomeFill, GoHome } from "react-icons/go";
import { HiComputerDesktop } from "react-icons/hi2";
import { IoIosSunny } from "react-icons/io";
import {
  IoCompass,
  IoCompassOutline,
  IoInformationCircle,
  IoInformationCircleOutline,
  IoMoon,
} from "react-icons/io5";
import { TbFolder, TbFolderFilled } from "react-icons/tb";

export const siteConfig: SiteConfigType = {
  name: "SnapFlix",
  description: "Watch Movies & TV Shows Online on SnapFlix - Your Private Streaming Platform.",
  favicon: "/snapflix.png",
  navItems: [
    {
      label: "Home",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "Discover",
      href: "/discover",
      icon: <IoCompassOutline className="size-full" />,
      activeIcon: <IoCompass className="size-full" />,
    },
    {
      label: "Library",
      href: "/library",
      icon: <TbFolder className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
    {
      label: "About",
      href: "/about",
      icon: <IoInformationCircleOutline className="size-full" />,
      activeIcon: <IoInformationCircle className="size-full" />,
    },
  ],
  themes: [
    {
      name: "light",
      icon: <IoIosSunny className="size-full" />,
    },
    {
      name: "dark",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "system",
      icon: <HiComputerDesktop className="size-full" />,
    },
  ],
  /**
   * Every row is resolved by a server action, so the TMDB token never leaves
   * the server and the responses are cached and shared between visitors.
   */
  queryLists: {
    movies: [
      {
        name: "Today's Trending Movies",
        query: () => getTrendingMovies({ timeWindow: "day" }),
        param: "todayTrending",
      },
      {
        name: "This Week's Trending Movies",
        query: () => getTrendingMovies({ timeWindow: "week" }),
        param: "thisWeekTrending",
      },
      {
        name: "Popular Movies",
        query: () => getMovieList({ type: "popular" }),
        param: "popular",
      },
      {
        name: "Now Playing Movies",
        query: () => getMovieList({ type: "nowPlaying" }),
        param: "nowPlaying",
      },
      {
        name: "Upcoming Movies",
        query: () => getMovieList({ type: "upcoming" }),
        param: "upcoming",
      },
      {
        name: "Top Rated Movies",
        query: () => getMovieList({ type: "topRated" }),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "Today's Trending TV Shows",
        query: () => getTrendingTvShows({ timeWindow: "day" }),
        param: "todayTrending",
      },
      {
        name: "This Week's Trending TV Shows",
        query: () => getTrendingTvShows({ timeWindow: "week" }),
        param: "thisWeekTrending",
      },
      {
        name: "Popular TV Shows",
        query: () => getTvList({ type: "popular" }),
        param: "popular",
      },
      {
        name: "On The Air TV Shows",
        query: () => getTvList({ type: "onTheAir" }),
        param: "onTheAir",
      },
      {
        name: "Top Rated TV Shows",
        query: () => getTvList({ type: "topRated" }),
        param: "topRated",
      },
    ],
  },
  socials: {
    help: "/about",
  },
};

export type SiteConfig = typeof siteConfig;
