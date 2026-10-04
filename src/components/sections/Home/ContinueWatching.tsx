"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import ResumeCard from "./Cards/Resume";
import { useQuery } from "@tanstack/react-query";
import { getUserHistories } from "@/actions/histories";
import RowHeader from "@/components/ui/other/RowHeader";
import type { HistoryDetail } from "@/types/movie";

const ContinueWatching: React.FC = () => {
  const { data: list } = useQuery({
    queryFn: async (): Promise<HistoryDetail[]> => {
      // 1. Fetch Supabase histories (for logged in users)
      let serverItems: HistoryDetail[] = [];
      try {
        const res = await getUserHistories();
        if (res?.success && Array.isArray(res.data)) {
          serverItems = res.data;
        }
      } catch (e) {}

      // 2. Fetch localStorage histories (for guests & offline)
      let guestItems: HistoryDetail[] = [];
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("snapflix_guest_history");
          if (stored) {
            guestItems = JSON.parse(stored);
          }
        }
      } catch (e) {}

      // 3. Merge: prefer server items, append non-duplicate guest items
      const map = new Map<string, HistoryDetail>();
      for (const item of serverItems) {
        const key = `${item.type}_${item.media_id}_${item.season}_${item.episode}`;
        map.set(key, item);
      }
      for (const item of guestItems) {
        const key = `${item.type}_${item.media_id}_${item.season}_${item.episode}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
      }

      // 4. Sort by latest updated_at
      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );

      // 5. Deduplicate by show so each series displays its most recently watched episode
      const showMap = new Map<string, HistoryDetail>();
      for (const item of combined) {
        const key = `${item.type}_${item.media_id}`;
        if (!showMap.has(key)) {
          showMap.set(key, item);
        }
      }

      return Array.from(showMap.values());
    },
    queryKey: ["continue-watching"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  if (!list || list.length === 0) return null;

  return (
    <section id="continue-watching" className="flex flex-col gap-2 min-h-[220px] px-4 md:px-12">
      <RowHeader title="Continue watching" />
      <Carousel>
        {list.map((media) => (
          <div
            key={`${media.type}_${media.media_id}_${media.season}_${media.episode}`}
            className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
          >
            <ResumeCard media={media} />
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default ContinueWatching;
