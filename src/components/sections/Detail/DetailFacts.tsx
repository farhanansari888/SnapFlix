const languageNames: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
};

export const languageLabel = (code?: string | null) => {
  if (!code) return null;
  return languageNames[code] || code.toUpperCase();
};

interface DetailFactsProps {
  overview?: string;
  tagline?: string;
  facts: Array<[string, React.ReactNode]>;
}

const DetailFacts: React.FC<DetailFactsProps> = ({ overview, tagline, facts }) => {
  const visible = facts.filter((item): item is [string, React.ReactNode] => Boolean(item[1]));
  if (!overview && !tagline && visible.length === 0) return null;

  return (
    <section className="px-4 md:px-12">
      <div className="max-w-3xl">
        {tagline && <p className="mb-2 text-sm text-white/50 italic">&ldquo;{tagline}&rdquo;</p>}
        {overview && <p className="text-sm leading-relaxed text-white/80 sm:text-base">{overview}</p>}
        {visible.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {visible.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold tracking-wide text-white/40 uppercase">{label}</dt>
                <dd className="mt-1 text-sm text-white/90">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
};

export default DetailFacts;
