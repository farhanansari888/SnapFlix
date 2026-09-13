import { forwardRef, memo, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Link,
  Select,
  SelectItem,
  Input,
  ScrollShadow,
  Tabs,
  Tab,
  Tooltip,
} from "@heroui/react";
import { Season } from "tmdb-ts";
import { Grid, List, Search, SortAlpha } from "@/utils/icons";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import dynamic from "next/dynamic";
import IconButton from "@/components/ui/button/IconButton";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { titleCase } from "string-ts";
const TvShowEpisodesSelection = dynamic(() => import("./Episodes"));

interface Props {
  id: number;
  seasons: Season[];
}

const TvShowsSeasonsSelection = forwardRef<HTMLElement, Props>(({ id, seasons }, ref) => {
  const FILTERED_SEASONS = useMemo(() => seasons.filter((s) => s.season_number > 0), [seasons]);
  const [sortedByName, { toggle, close }] = useDisclosure(false);
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebouncedValue(search, 300);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [seasonNumber, setSeasonNumber] = useState(() =>
    FILTERED_SEASONS[0]?.season_number?.toString() || "1",
  );

  return (
    <section ref={ref} id="seasons-episodes" className="z-3 flex flex-col gap-2">
      <SectionTitle color="warning">Season & Episode</SectionTitle>
      <Card className="sm:p-3">
        <CardHeader className="grid grid-cols-1 grid-rows-[1fr_auto] gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <Select
            aria-label="Seasons"
            selectedKeys={[seasonNumber]}
            disallowEmptySelection={true}
            classNames={{ trigger: "border-2 border-foreground-200" }}
            onChange={(e) => {
              close();
              setSearch("");
              setSeasonNumber(e.target.value);
            }}
          >
            {FILTERED_SEASONS.map(({ season_number, name }) => (
              <SelectItem key={season_number.toString()}>{name}</SelectItem>
            ))}
          </Select>
          <Input
            isClearable
            aria-label="Search Episodes"
            placeholder="Search episodes..."
            value={search}
            onValueChange={setSearch}
            startContent={<Search />}
            classNames={{ inputWrapper: "border-2 border-foreground-200" }}
          />
          <Tooltip content={titleCase(layout)}>
            <Tabs
              color="warning"
              aria-label="Layout Select"
              size="sm"
              classNames={{ tabList: "border-2 border-foreground-200" }}
              onSelectionChange={(value) => setLayout(value as typeof layout)}
              selectedKey={layout}
            >
              <Tab key="list" title={<List />} />
              <Tab key="grid" title={<Grid />} />
            </Tabs>
          </Tooltip>
          <IconButton
            tooltip="Sort by name"
            className="p-2"
            icon={<SortAlpha />}
            onPress={toggle}
            color={sortedByName ? "warning" : undefined}
            variant={sortedByName ? "shadow" : "faded"}
          />
        </CardHeader>
        <CardBody>
          <ScrollShadow className="h-[600px] py-2 pr-2 sm:pr-3">
            <TvShowEpisodesSelection
              id={id}
              seasonNumber={Number(seasonNumber)}
              filters={{ searchQuery, sortedByName, layout }}
            />
          </ScrollShadow>
        </CardBody>
      </Card>
    </section>
  );
});

TvShowsSeasonsSelection.displayName = "TvShowsSeasonsSelection";

export default memo(TvShowsSeasonsSelection);
