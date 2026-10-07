import { cn } from "@/utils/helpers";
import Link from "next/link";

interface RowHeaderProps {
  title: string;
  href?: string;
  accent?: string;
  className?: string;
  actionLabel?: string;
}

const RowHeader: React.FC<RowHeaderProps> = ({
  title,
  href,
  accent,
  actionLabel = "See all",
  className,
}) => {
  const heading = (
    <h2 className="flex min-w-0 items-baseline gap-2 text-lg font-semibold tracking-tight text-white text-balance sm:text-xl md:text-[1.35rem]">
      <span aria-hidden className="mt-1 h-4 w-1 shrink-0 self-center rounded-full bg-[#E50914]" />
      {accent ? (
        <>
          <span className="text-[#E50914]">{accent}</span>
          <span className="truncate">{title}</span>
        </>
      ) : (
        <span className="truncate">{title}</span>
      )}
    </h2>
  );

  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      {href ? (
        <Link
          href={href}
          className="min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E50914]"
        >
          {heading}
          <span className="sr-only">, see all</span>
        </Link>
      ) : (
        heading
      )}
      {href && (
        <Link
          href={href}
          className="sf-chip shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/16 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default RowHeader;
