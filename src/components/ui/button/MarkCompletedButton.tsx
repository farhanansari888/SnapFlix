"use client";

import { setHistoryCompleted } from "@/actions/histories";
import { queryClient } from "@/app/providers";
import { GUEST_HISTORY_KEY, WATCH_HISTORY_QUERY_KEY, useWatchHistory } from "@/hooks/useWatchHistory";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import type { HistoryDetail } from "@/types/movie";
import { cn } from "@/utils/helpers";
import { addToast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { IoCheckmarkCircle, IoCheckmarkCircleOutline } from "react-icons/io5";

interface MarkCompletedButtonProps {
  /** TMDB movie id. Only movies are supported - the control never shows for TV. */
  movieId: number;
  className?: string;
}

/**
 * Manual "mark as watched" toggle for the movie detail page.
 *
 * Only renders when this movie already has a Continue Watching entry (guest
 * localStorage and/or Supabase for signed in users) - a movie that was never
 * played has nothing to mark. Toggling updates both the guest copy and,
 * when signed in, the synced Supabase row, then refreshes Continue Watching.
 */
const MarkCompletedButton: React.FC<MarkCompletedButtonProps> = ({ movieId, className }) => {
  const { data: user } = useSupabaseUser();
  const { data: history } = useWatchHistory();

  const entry = history?.find(
    (item) => item.type === "movie" && Number(item.media_id) === Number(movieId),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!entry) return;
      const nextCompleted = !entry.completed;

      // 1. Always update the guest/local copy so it reflects instantly, even offline.
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(GUEST_HISTORY_KEY);
          const list: HistoryDetail[] = stored ? JSON.parse(stored) : [];
          const idx = list.findIndex(
            (item) =>
              String(item.media_id) === String(entry.media_id) &&
              item.type === entry.type &&
              Number(item.season || 0) === Number(entry.season || 0) &&
              Number(item.episode || 0) === Number(entry.episode || 0),
          );
          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              completed: nextCompleted,
              updated_at: new Date().toISOString(),
            };
            localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(list));
          }
        }
      } catch {}

      // 2. Keep Supabase in sync for signed in users.
      if (user) {
        await setHistoryCompleted(entry, nextCompleted);
      }

      return nextCompleted;
    },
    onSuccess: (nextCompleted) => {
      if (nextCompleted === undefined) return;
      queryClient.invalidateQueries({ queryKey: WATCH_HISTORY_QUERY_KEY });
      addToast({
        title: nextCompleted ? "Marked as watched" : "Marked as not watched",
        color: nextCompleted ? "success" : "default",
      });
    },
    onError: () => {
      addToast({
        title: "Couldn't update this title",
        description: "Please try again.",
        color: "danger",
      });
    },
  });

  if (!entry) return null;

  const isCompleted = Boolean(entry.completed);

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      aria-pressed={isCompleted}
      className={cn(
        "sf-chip inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
        isCompleted ? "text-[#46d369]" : "text-white",
        className,
      )}
    >
      {isCompleted ? (
        <IoCheckmarkCircle className="size-5" />
      ) : (
        <IoCheckmarkCircleOutline className="size-5" />
      )}
      {isCompleted ? "Watched" : "Mark as Watched"}
    </button>
  );
};

export default MarkCompletedButton;
