import { formatNumber } from "@/utils/helpers";
import { Star } from "@/utils/icons";

export interface RatingProps {
  rate: number;
  count?: number;
}

const Rating: React.FC<RatingProps> = ({ rate = 0, count = 0 }) => {
  return (
    <div className="flex items-center gap-1 font-semibold text-warning-500">
      <Star />
      <p>
        {rate.toFixed(1)} {count > 0 && `(${formatNumber(count)})`}
      </p>
    </div>
  );
};

export default Rating;
