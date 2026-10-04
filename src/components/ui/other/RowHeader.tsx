import { cn } from "@/utils/helpers";
import Link from "next/link";

interface RowHeaderProps {
  title: string;
  href?: string;
  accent?: string;
  eyebrow?: string;
  actionLabel?: string;
  className?: string;
}

const RowHeader: React.FC<RowHeaderProps> = ({
  title,
  href,
  accent,
  eyebrow,
  actionLabel = "See all",
  className,
}) => {
  const heading = (
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-1 text-[10px] font-bold tracking-[0.28em] text-[#E50914] uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="flex min-w-0 items-center gap-2.5 text-lg font-bold tracking-tight text-white sm:text-xl md:text-[1.4rem]">
        <span
          aria-hidden
          className="h-5 w-1 shrink-0 rounded-full bg-[#E50914] shadow-[0_0_14px_rgba(229,9,20,0.75)]"
        />
        {accent ? (
          <>
            <span className="text-[#E50914]">{accent}</span>
            <span className="truncate">{title}</span>
          </>
        ) : (
          <span className="truncate">{title}</span>
        )}
      </h2>
    </div>
  );

  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      {href ? (
        <Link href={href} className="group/row min-w-0">
          {heading}
          <span className="sr-only">Explore {title}</span>
        </Link>
      ) : (
        heading
      )}
      {href && (
        <Link
          href={href}
          className="group/see shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-zinc-300 transition hover:border-[#E50914]/50 hover:bg-[#E50914]/15 hover:text-white"
        >
          <span className="inline-flex items-center gap-1">
            {actionLabel}
            <span aria-hidden className="transition group-hover/see:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
      )}
    </div>
  );
};

export default RowHeader;
