import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Footer from "@/components/ui/layout/Footer";

const DiscoverListGroup = dynamic(() => import("@/components/sections/Discover/ListGroup"));

export const metadata: Metadata = {
  title: `New & Popular | ${siteConfig.name}`,
};

const DiscoverPage: NextPage = () => {
  return (
    <Suspense>
      <div className="flex flex-col">
        <DiscoverListGroup />
        <Footer />
      </div>
    </Suspense>
  );
};

export default DiscoverPage;
