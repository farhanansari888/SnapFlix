import { Metadata, NextPage } from "next/types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import Footer from "@/components/ui/layout/Footer";
import PopcornTvLoader from "@/components/ui/other/PopcornTvLoader";
import { siteConfig } from "@/config/site";

const SearchList = dynamic(() => import("@/components/sections/Search/List"));

export const metadata: Metadata = {
  title: `Search | ${siteConfig.name}`,
};

const SearchPage: NextPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <PopcornTvLoader size="lg" label="Opening search" />
        </div>
      }
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl min-w-0 flex-col px-4 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-8 sm:px-8 md:px-12">
        <SearchList />
      </div>
      <Footer />
    </Suspense>
  );
};

export default SearchPage;
