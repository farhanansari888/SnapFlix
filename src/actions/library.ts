"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Types
type ContentType = "movie" | "tv";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType;
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry extends WatchlistItem {
  user_id: string;
  created_at: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface WatchlistResponse extends ActionResponse<WatchlistEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

interface CheckWatchlistResponse extends ActionResponse {
  isInWatchlist: boolean;
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
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
        error: "You must be logged in to add items to watchlist",
      };
    }

    // Validate required fields
    if (!item.id || !item.type || !item.title) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(item.type)) {
      return {
        success: false,
        error: 'Invalid content type. Must be "movie" or "tv"',
      };
    }

    // Add to watchlist
    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        id: item.id,
        type: item.type,
        adult: item.adult || false,
        backdrop_path: item.backdrop_path || "",
        poster_path: item.poster_path || null,
        release_date: item.release_date || new Date().toISOString().split("T")[0],
        title: item.title,
        vote_average: item.vote_average || 0,
      })
      .select()
      .single<WatchlistEntry>();

    if (error) {
      // Check if it's a duplicate error
      if (error.code === "23505") {
        return {
          success: false,
          error: "This item is already in your watchlist",
        };
      }

      console.error("Watchlist add error:", error);
      return {
        success: false,
        error: "Failed to add item to watchlist",
      };
    }

    // Revalidate the watchlist page if you have one
    revalidatePath("/library");

    return {
      success: true,
      data,
      message: "Added to watchlist successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
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
        error: "You must be logged in to remove items from watchlist",
      };
    }

    // Validate inputs
    if (!id || !type) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    // Delete from watchlist
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type);

    if (error) {
      console.error("Watchlist remove error:", error);
      return {
        success: false,
        error: "Failed to remove item from watchlist",
      };
    }

    // Revalidate the watchlist page
    revalidatePath("/library");

    return {
      success: true,
      message: "Removed from watchlist successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Remove all items from watchlist
 */
export const removeAllWatchlist = async (type: ContentType): Promise<ActionResponse> => {
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
        error: "You must be logged in to remove items from watchlist",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    // Delete from watchlist
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("type", type);

    if (error) {
      console.error("Watchlist remove error:", error);
      return {
        success: false,
        error: "Failed to remove items from watchlist",
      };
    }

    // Revalidate the watchlist page
    revalidatePath("/library");

    return {
      success: true,
      message: "Removed items from watchlist successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
};

/**
 * Check if item is in watchlist
 */
export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
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
        isInWatchlist: false,
        error: "User not authenticated",
      };
    }

    // Check if exists
    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Watchlist check error:", error);
      return {
        success: false,
        isInWatchlist: false,
        error: "Failed to check watchlist status",
      };
    }

    return {
      success: true,
      isInWatchlist: !!data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      isInWatchlist: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's watchlist with pagination - optimized for infinite scroll
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
): Promise<WatchlistResponse> {
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
        data: [],
        error: "User not authenticated",
      };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("watchlist")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply type filter if not 'all'
    if (filterType !== "all" && ["movie", "tv"].includes(filterType)) {
      query = query.eq("type", filterType);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Watchlist fetch error:", error);
      return {
        success: false,
        data: [],
        error: "Failed to fetch watchlist",
      };
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data: (data as WatchlistEntry[]) || [],
      totalCount: count || 0,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      data: [],
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Toggle watchlist status (helper function)
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  const checkResult = await checkInWatchlist(item.id, item.type);

  if (!checkResult.success) {
    return checkResult;
  }

  if (checkResult.isInWatchlist) {
    return await removeFromWatchlist(item.id, item.type);
  } else {
    return await addToWatchlist(item);
  }
}
