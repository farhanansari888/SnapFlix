"use client";

import { useCustomCarousel } from "@/hooks/useCustomCarousel";
import { ScrollShadow } from "@heroui/react";
import IconButton from "../button/IconButton";
import { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { cn } from "@/utils/helpers";
import styles from "@/styles/embla-carousel.module.css";
import { ChevronLeft, ChevronRight } from "@/utils/icons";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  withScrollShadow?: boolean;
  isButtonDisabled?: boolean;
  autoHideButton?: boolean;
  options?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  classNames?: {
    container?: string;
    viewport?: string;
    wrapper?: string;
  };
}

const Carousel = ({
  children,
  withScrollShadow = false,
  isButtonDisabled = false,
  autoHideButton = true,
  options = { dragFree: true, slidesToScroll: "auto" },
  plugins,
  classNames,
  ...props
}: CarouselProps) => {
  const c = useCustomCarousel(options, plugins);

  const getVisibility = () => {
    if (c.canScrollPrev && c.canScrollNext) return "both";
    if (c.canScrollPrev) return "left";
    if (c.canScrollNext) return "right";
    return "none";
  };

  return (
    <ScrollShadow
      isEnabled={withScrollShadow}
      orientation="horizontal"
      visibility={getVisibility()}
      size={40}
      hideScrollBar
    >
      <div
        {...props}
        className={cn("group/rail", styles.wrapper, classNames?.wrapper, {
          "relative flex w-full flex-col justify-center": !isButtonDisabled,
        })}
      >
        {!isButtonDisabled && (
          <>
            <IconButton
              onPress={c.scrollPrev}
              aria-label="Scroll previous"
              radius="full"
              disableRipple
              icon={<ChevronLeft className="size-5 text-white" />}
              className={cn(
                "sf-glass-strong absolute top-1/2 left-2 z-20 hidden size-11 min-w-11 -translate-y-1/2 rounded-full border-white/25 bg-transparent text-white md:flex",
                autoHideButton && "opacity-0 group-hover/rail:opacity-100",
                !c.canScrollPrev && "!hidden",
              )}
            />
            <IconButton
              onPress={c.scrollNext}
              aria-label="Scroll next"
              radius="full"
              disableRipple
              icon={<ChevronRight className="size-5 text-white" />}
              className={cn(
                "sf-glass-strong absolute top-1/2 right-2 z-20 hidden size-11 min-w-11 -translate-y-1/2 rounded-full border-white/25 bg-transparent text-white md:flex",
                autoHideButton && "opacity-0 group-hover/rail:opacity-100",
                !c.canScrollNext && "!hidden",
              )}
            />
          </>
        )}
        <div className={cn("overflow-hidden", styles.viewport, classNames?.viewport)} ref={c.emblaRef}>
          <div className={cn(styles.container, classNames?.container)}>{children}</div>
        </div>
      </div>
    </ScrollShadow>
  );
};

export default Carousel;
