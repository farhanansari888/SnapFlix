import { cn } from "@/utils/helpers";

export type HighlightProps = React.ComponentPropsWithoutRef<"p"> & {
  children: string;
  highlight: string | string[];
  markType?: "mark" | "bold";
};

const Highlight: React.FC<HighlightProps> = ({
  children,
  highlight,
  markType = "mark",
  ...props
}) => {
  if (!highlight || !children) return <p {...props}>{children}</p>;

  // Convert highlight prop to array
  const terms = Array.isArray(highlight) ? highlight : [highlight];

  // Escape regex special chars and remove trailing whitespace
  const escapedTerms = terms
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escapedTerms.length === 0) return <p {...props}>{children}</p>;

  // Create regex to match any of the highlight terms (case-insensitive, global)
  const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");

  // Split text into parts and wrap matches in <mark>
  const parts = children.split(regex);

  return (
    <p {...props}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className={cn({
              "text-background bg-warning rounded-small px-1": markType === "mark",
              "bg-transparent font-extrabold text-inherit": markType === "bold",
            })}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
};

export default Highlight;
