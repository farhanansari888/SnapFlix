import { useMediaQuery } from "@mantine/hooks";

/**
 * Provides an object with properties that represent the different breakpoints
 * that Tailwind uses. The properties are named after the breakpoints, and
 * their values are boolean values indicating whether the breakpoint matches
 * the current screen size. Additionally, the object contains three more
 * properties: mobile, tablet, and desktop, which are useful shortcuts for
 * determining the current screen size.
 *
 * @returns {Object} An object with properties for each breakpoint, and
 * mobile, tablet, and desktop properties.
 */
export default function useBreakpoints() {
  const sm = useMediaQuery("(min-width: 640px)");
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const xl = useMediaQuery("(min-width: 1280px)");
  const xxl = useMediaQuery("(min-width: 1536px)");

  const mobile = !md;
  const tablet = md && !lg;
  const desktop = lg;

  return { sm, md, lg, xl, xxl, mobile, tablet, desktop };
}
