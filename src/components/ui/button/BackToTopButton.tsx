"use client";

import { useWindowScroll } from "@mantine/hooks";
import IconButton from "./IconButton";
import { MdKeyboardArrowUp } from "react-icons/md";
import { cn } from "@/utils/helpers";

const BackToTopButton: React.FC = () => {
  const [{ y }, scrollTo] = useWindowScroll();
  const isVisible = y > 300;

  const scrollToTop = () => {
    scrollTo({ y: 0 });
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed right-4 bottom-[max(7.5rem,calc(env(safe-area-inset-bottom)+6.5rem))] z-40 transition-opacity md:bottom-4")}>
      <IconButton
        onPress={scrollToTop}
        icon={<MdKeyboardArrowUp size={24} />}
        variant="shadow"
        color="primary"
        className="sf-glass-strong motion-preset-focus text-white"
        tooltip="Back to top"
        tooltipProps={{ placement: "left" }}
        radius="full"
        size="lg"
      />
    </div>
  );
};

export default BackToTopButton;
