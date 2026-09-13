import { useId } from "@mantine/hooks";
import { Fragment, PropsWithChildren } from "react";

export interface LoopProps extends PropsWithChildren {
  count: number;
  prefix?: string;
}

/**
 * Loops the given children component `count` times.
 * Useful for mocking data before real data is available.
 *
 * @param count The number of times to loop the children.
 * @param prefix The prefix to use for the React key.
 * @param children The children component to loop.
 */
const Loop: React.FC<LoopProps> = ({ count, prefix, children }) => {
  const id = useId();
  const key = prefix || id;

  return Array.from({ length: count }).map((_, index) => (
    <Fragment key={`${key}-${index + 1}`}>{children}</Fragment>
  ));
};

export default Loop;
