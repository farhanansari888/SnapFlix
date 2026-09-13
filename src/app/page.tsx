import { NextPage } from "next";
import dynamic from "next/dynamic";
import Footer from "@/components/ui/layout/Footer";

const NetflixHeroBillboard = dynamic(
  () => import("@/components/sections/Home/NetflixHeroBillboard"),
);
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

interface HomePageProps {
  searchParams: Promise<{
    content?: "movie" | "tv";
  }>;
}

const HomePage: NextPage<HomePageProps> = async ({ searchParams }) => {
  const { content } = await searchParams;

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* Netflix Full-Bleed Cinematic Hero Billboard */}
      <NetflixHeroBillboard contentType={content === "tv" ? "tv" : "movie"} />

      {/* User continue watching */}
      <ContinueWatching />

      {/* Netflix Content Rows & Top 10 */}
      <HomePageList />

      {/* Netflix Styled Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
