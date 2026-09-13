"use client";

import Link from "next/link";
import { BebasNeue } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import { useId } from "react";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  size = "md",
  align = "center",
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const pathId = `netflix-arch-${id}`;
  const filterId = `netflix-glow-${id}`;

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center transition-transform duration-300 hover:scale-105 active:scale-95 shrink-0 select-none",
        className,
      )}
      aria-label="SnapFlix Home"
    >
      {/* Netflix-style Arched Curved Wordmark SNAPFLIX (No preceding logo icon) */}
      <svg
        viewBox={align === "left" ? "25 0 122 38" : "0 0 170 38"}
        className={cn(
          "w-auto select-none overflow-visible",
          size === "sm" && "h-7 sm:h-8",
          size === "md" && "h-8 sm:h-9 md:h-10",
          size === "lg" && "h-10 sm:h-12",
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Netflix Signature Upward Arc Baseline */}
          <path id={pathId} d="M 6,31 Q 85,21 164,31" fill="none" />
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E50914" floodOpacity="0.45" />
          </filter>
        </defs>
        <text
          fill="#E50914"
          fontWeight="900"
          fontSize="26"
          letterSpacing="2.2"
          filter={`url(#${filterId})`}
          className={cn(
            "transition-all duration-300 group-hover:brightness-110",
            BebasNeue.className,
          )}
          style={{
            fontFamily: "var(--font-bebas-neue), 'Bebas Neue', Impact, 'Arial Black', sans-serif",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            SNAPFLIX
          </textPath>
        </text>
      </svg>
    </Link>
  );
};

export default BrandLogo;
