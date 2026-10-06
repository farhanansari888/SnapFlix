"use server";

import { searchTitles } from "@/actions/lists";
import { ActionResponse } from "@/types";
import { isEmpty } from "@/utils/helpers";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv";
};

export const getSearchSuggestions = async (
  query: string,
  limit: number = 10,
): Promise<ActionResponse<SearchSuggestion[] | null>> => {
  try {
    // Server actions are public endpoints: only accept a non empty string.
    const searchQuery = typeof query === "string" ? query.trim().slice(0, 200) : "";

    if (isEmpty(searchQuery)) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    // Real TMDB results only: movies + TV shows queried server side.
    const response = await searchTitles({ query: searchQuery, limit: limit * 3 });

    if (!response.ok) {
      console.error("TMDB suggestion error:", response.message);

      return {
        success: false,
        message: "TMDB is unavailable",
        data: null,
      };
    }

    const suggestions: SearchSuggestion[] = response.data.map(({ id, title, media_type }) => ({
      id,
      title,
      type: media_type,
    }));

    if (isEmpty(suggestions)) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    const queryLower = searchQuery.toLowerCase();

    // Deduplicate identical titles, then rank: prefix matches first, then by
    // how early the query appears in the title, then alphabetically.
    const deduped = suggestions.filter(
      (data, index, self) =>
        index === self.findIndex((t) => t.title.toLowerCase() === data.title.toLowerCase()),
    );

    const sortedSuggestions = deduped.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      const aIndex = aTitle.indexOf(queryLower);
      const bIndex = bTitle.indexOf(queryLower);

      if (aIndex !== bIndex) return aIndex - bIndex;
      return aTitle.localeCompare(bTitle);
    });

    return {
      success: true,
      message: "Search suggestions fetched",
      data: sortedSuggestions.slice(0, limit),
    };
  } catch (error) {
    console.error("Search suggestions error:", error);

    return {
      success: false,
      message: "Error fetching search suggestions",
      data: null,
    };
  }
};
