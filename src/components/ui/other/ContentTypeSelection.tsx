"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { Movie, TV } from "@/utils/icons";
import { Tabs, Tab, TabsProps } from "@heroui/react";

interface ContentTypeSelectionProps extends TabsProps {
  onTypeChange?: (type: ContentType) => void;
}

const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({ onTypeChange, ...props }) => {
  const { content, setContent, resetFilters } = useDiscoverFilters();

  const handleTabChange = (key: ContentType) => {
    resetFilters();
    setContent(key);
    onTypeChange?.(key);
  };

  return (
    <Tabs
      size="md"
      variant="solid"
      selectedKey={content}
      aria-label="Content Type Selection"
      color="primary"
      onSelectionChange={(value) => handleTabChange(value as ContentType)}
      classNames={{
        tabList: "bg-[#181818] p-1 rounded-full border border-white/10 shadow-lg",
        cursor: "bg-[#E50914] rounded-full shadow-md shadow-red-950/50",
        tab: "px-5 py-1.5 h-8 text-xs md:text-sm font-semibold text-gray-400 data-[selected=true]:text-white transition-colors",
      }}
      {...props}
    >
      <Tab
        key="movie"
        title={
          <div className="flex items-center space-x-2">
            <Movie />
            <span>Movies</span>
          </div>
        }
      />
      <Tab
        key="tv"
        title={
          <div className="flex items-center space-x-2">
            <TV />
            <span>TV Series</span>
          </div>
        }
      />
    </Tabs>
  );
};

export default ContentTypeSelection;
