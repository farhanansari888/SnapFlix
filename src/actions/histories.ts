"use server";

import { tmdb } from "@/api/tmdb";
import { UnifiedPlayerEventData } from "@/hooks/usePlayerEvents";
import { ActionResponse } from "@/types";
import { HistoryDetail } from "@/types/movie";
import { mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const syncHistory = async (
  data: UnifiedPlayerEventData,
  completed?: boolean,
): ActionResponse => {
  console.info("Saving history:", data);

  if (!data) return { success: false, message: "No data to save" };

  if (data.mediaType === "tv" && (!data.season || !data.episode)) {
    return { success: false, message: "Missing season or episode" };
  }

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "You must be logged in to save history",
      };
    }

    // Validate required fields
    if (!data.mediaId || !data.mediaType) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(data.mediaType)) {
      return {
        success: false,
        message: 'Invalid content type. Must be "movie" or "tv"',
      };
    }

    const media =
      data.mediaType === "movie"
        ? await tmdb.movies.details(Number(data.mediaId))
        : await tmdb.tvShows.details(Number(data.mediaId));

    // Insert or update history
    const { data: history, error } = await supabase
      .from("histories")
      .upsert(
        {
          user_id: user.id,
          media_id: Number(data.mediaId),
          type: data.mediaType,
          season: data.season || 0,
          episode: data.episode || 0,
          duration: data.duration,
          last_position: data.currentTime,
          completed: completed || false,
          adult: "adult" in media ? media.adult : false,
          backdrop_path: media.backdrop_path,
          poster_path: media.poster_path,
          release_date: "release_date" in media ? media.release_date : media.first_air_date,
          title: "title" in media ? mutateMovieTitle(media) : mutateTvShowTitle(media),
          vote_average: media.vote_average,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,media_id,type,season,episode",
        },
      )
      .select();

    if (error) {
      console.info("History save error:", error);
      return {
        success: false,
        message: "Failed to save history",
      };
    }

    console.info("History saved:", history);

    return {
      success: true,
      message: "History saved",
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

/**
 * Manually flips the `completed` flag on an existing history row (the
 * "Mark as watched" control on the movie page). Only touches Supabase - the
 * caller is responsible for also updating the local/guest copy, since guests
 * never reach this action's auth check.
 */
export const setHistoryCompleted = async (
  entry: Pick<
    HistoryDetail,
    | "media_id"
    | "type"
    | "season"
    | "episode"
    | "duration"
    | "last_position"
    | "adult"
    | "backdrop_path"
    | "poster_path"
    | "release_date"
    | "title"
    | "vote_average"
  >,
  completed: boolean,
): ActionResponse => {
  if (!entry?.media_id || !entry?.type) {
    return { success: false, message: "Missing required fields" };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: "You must be logged in to sync this change" };
    }

    const { error } = await supabase.from("histories").upsert(
      {
        user_id: user.id,
        media_id: Number(entry.media_id),
        type: entry.type,
        season: entry.season || 0,
        episode: entry.episode || 0,
        duration: entry.duration,
        last_position: entry.last_position,
        completed,
        adult: entry.adult || false,
        backdrop_path: entry.backdrop_path,
        poster_path: entry.poster_path,
        release_date: entry.release_date,
        title: entry.title,
        vote_average: entry.vote_average,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,media_id,type,season,episode" },
    );

    if (error) {
      console.info("History update error:", error);
      return { success: false, message: "Failed to update history" };
    }

    return { success: true, message: "History updated" };
  } catch (error) {
    console.info("Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

export const getUserHistories = async (limit: number = 20): ActionResponse<HistoryDetail[]> => {
  try {
    const cookieStore = await cookies();
    const hasAuthToken = cookieStore
      .getAll()
      .some((c) => c.name.includes("auth-token") || c.name.startsWith("sb-"));

    if (!hasAuthToken) {
      return {
        success: false,
        message: "User not authenticated",
        data: [],
      };
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const { data, error } = await supabase
      .from("histories")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.info("History fetch error:", error);
      return {
        success: false,
        message: "Failed to fetch history",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getMovieLastPosition = async (id: number): Promise<number> => {
  try {
    const cookieStore = await cookies();
    const hasAuthToken = cookieStore
      .getAll()
      .some((c) => c.name.includes("auth-token") || c.name.startsWith("sb-"));

    if (!hasAuthToken) return 0;

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "movie");

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};

export const getTvShowLastPosition = async (
  id: number,
  season: number,
  episode: number,
): Promise<number> => {
  try {
    const cookieStore = await cookies();
    const hasAuthToken = cookieStore
      .getAll()
      .some((c) => c.name.includes("auth-token") || c.name.startsWith("sb-"));

    if (!hasAuthToken) return 0;

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "tv")
      .eq("season", season)
      .eq("episode", episode);

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};
