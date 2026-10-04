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
        tabList: "sf-glass rounded-full gap-1 p-1 shadow-none",
        cursor: "rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
        tab: "h-10 px-3.5 md:h-11 md:px-5",
        tabContent:
          "flex items-center gap-1.5 text-xs font-semibold text-white/85! group-data-[selected=true]:text-black! md:text-sm",
      }}
      {...props}
    >
      <Tab
        key="movie"
        title={
          <div className="flex items-center gap-1.5">
            <Movie className="size-4 shrink-0" />
            <span>Movies</span>
          </div>
        }
      />
      <Tab
        key="tv"
        title={
          <div className="flex items-center gap-1.5">
            <TV className="size-4 shrink-0" />
            <span>TV Series</span>
          </div>
        }
      />
    </Tabs>
  );
};

export default ContentTypeSelection;
