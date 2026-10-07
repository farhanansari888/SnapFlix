import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Footer from "@/components/ui/layout/Footer";
import PopcornTvLoader from "@/components/ui/other/PopcornTvLoader";

const DiscoverListGroup = dynamic(() => import("@/components/sections/Discover/ListGroup"));

export const metadata: Metadata = {
  title: `New & Popular | ${siteConfig.name}`,
};

const DiscoverPage: NextPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <PopcornTvLoader size="lg" label="Loading new & popular" />
        </div>
      }
    >
      <div className="flex flex-col">
        <DiscoverListGroup />
        <Footer />
      </div>
    </Suspense>
  );
};

export default DiscoverPage;
