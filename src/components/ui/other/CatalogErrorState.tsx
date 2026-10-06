"use client";

import { Button } from "@heroui/react";
import { IoCloudOfflineOutline, IoRefreshOutline } from "react-icons/io5";

import { CatalogError } from "@/types";
import { CatalogRequestError, catalogErrorCopy } from "@/utils/catalog";
import { cn } from "@/utils/helpers";

interface CatalogErrorStateProps {
  /** Error thrown by the failing query. */
  error?: unknown;
  /** Called when the user presses "Try again". */
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Overrides the default title/description. */
  title?: string;
  description?: string;
  /** Renders a denser, single line friendly version. */
  compact?: boolean;
  className?: string;
}

/**
 * Shown whenever a TMDB backed section cannot load. It never fabricates data —
 * it explains what went wrong and offers a retry.
 */
const CatalogErrorState: React.FC<CatalogErrorStateProps> = ({
  error,
  onRetry,
  isRetrying = false,
  title,
  description,
  compact = false,
  className,
}) => {
  const code: CatalogError =
    error instanceof CatalogRequestError ? error.code : error ? "unavailable" : "unavailable";
  const copy = catalogErrorCopy(code);

  return (
    <div
      role="alert"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-center",
        compact ? "px-4 py-4" : "gap-3 px-6 py-8",
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full bg-[#E50914]/15 text-[#E50914]",
          compact ? "size-8" : "size-11",
        )}
      >
        <IoCloudOfflineOutline className={compact ? "size-4" : "size-6"} />
      </span>

      <div className="flex flex-col gap-1">
        <p className={cn("font-semibold text-white", compact ? "text-sm" : "text-base")}>
          {title ?? copy.title}
        </p>
        <p
          className={cn(
            "mx-auto max-w-md text-pretty text-white/60",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {description ?? copy.description}
        </p>
      </div>

      {onRetry && (
        <Button
          size="sm"
          radius="full"
          variant="flat"
          color="primary"
          onPress={onRetry}
          isLoading={isRetrying}
          startContent={!isRetrying ? <IoRefreshOutline className="size-4" /> : undefined}
          className="mt-1 font-semibold"
        >
          Try again
        </Button>
      )}
    </div>
  );
};

export default CatalogErrorState;
