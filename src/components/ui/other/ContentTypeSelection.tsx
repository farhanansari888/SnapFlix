"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { cn } from "@/utils/helpers";
import { FaFilm, FaTv } from "react-icons/fa6";

interface ContentTypeSelectionProps {
  onTypeChange?: (type: ContentType) => void;
  className?: string;
}

const OPTIONS = [
  { key: "movie" as const, label: "Movies", icon: FaFilm },
  { key: "tv" as const, label: "TV Series", icon: FaTv },
];

const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({ onTypeChange, className }) => {
  const { content, setContent, resetFilters } = useDiscoverFilters();

  const select = (key: ContentType) => {
    if (key === content) return;
    resetFilters();
    setContent(key);
    onTypeChange?.(key);
  };

  return (
    <div
      role="tablist"
      aria-label="Content type"
      className={cn("sf-glass inline-flex max-w-full items-center gap-1 rounded-full p-1", className)}
    >
      {OPTIONS.map((option) => {
        const selected = content === option.key;
        const Icon = option.icon;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => select(option.key)}
            className={cn(
              "flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap transition-colors sm:min-w-[7.25rem] sm:flex-none sm:px-4 sm:text-sm",
              selected
                ? "bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon size={12} aria-hidden className={selected ? "text-black" : "text-current"} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ContentTypeSelection;
