"use client";

import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { useCallback, useState } from "react";

/**
 * Custom hook that provides carousel functionality using Embla Carousel.
 *
 * @param {EmblaOptionsType} [options] - Optional configuration options for the Embla Carousel.
 * @param {EmblaPluginType[]} [plugins] - Optional array of plugins to enhance the carousel.
 * @returns {object} An object containing:
 * - `emblaRef`: Ref to attach to the carousel container.
 * - `scrollTo`: Function to scroll to a specific index.
 * - `scrollNext`: Function to scroll to the next item.
 * - `scrollPrev`: Function to scroll to the previous item.
 * - `selectedIndex`: The current selected index of the carousel.
 * - `canScrollNext`: Boolean indicating if the carousel can scroll to the next item.
 * - `canScrollPrev`: Boolean indicating if the carousel can scroll to the previous item.
 */
export const useCustomCarousel = (options?: EmblaOptionsType, plugins?: EmblaPluginType[]) => {
  const [emblaRef, embla] = useEmblaCarousel(options, plugins);

  const [canScrollNext, setCanScrollNext] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => embla && embla.scrollTo(index), [embla]);
  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);

  if (embla) {
    embla.on("select", () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
      setSelectedIndex(embla.selectedScrollSnap());
    });
  }

  return { emblaRef, scrollTo, scrollNext, scrollPrev, selectedIndex, canScrollNext, canScrollPrev };
};
