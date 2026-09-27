import { siteConfig } from "@/config/site";
import { Metadata, NextPage } from "next/types";
import { cache, Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/server";
const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const LibraryList = dynamic(() => import("@/components/sections/Library/List"));

export const metadata: Metadata = {
  title: `Library | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const LibraryPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <Suspense>
      <div className="w-full min-h-[calc(100dvh-80px)] pt-20 sm:pt-24 pb-28 md:pb-16 px-4 sm:px-6 md:px-12 max-w-7xl 2xl:max-w-[1800px] mx-auto">
        {error || !user ? (
          <UnauthorizedNotice
            title="Sign in to access your library"
            description="Create a free account to save your favorite movies and TV shows!"
          />
        ) : (
          <LibraryList />
        )}
      </div>
    </Suspense>
  );
};

export default LibraryPage;
