/**
 * Tiny SVG shape-morphing engine.
 *
 * Both icons are described by the same number of closed sub paths. Each sub
 * path is sampled into an equal amount of points, the point rings are
 * rotationally aligned (so shapes don't twist while morphing) and then
 * point-by-point interpolated into a smooth closed Catmull-Rom path.
 *
 * The module is framework/DOM free: the caller supplies any object that
 * implements `PathSampler` (a real `SVGPathElement` in the browser, a small
 * polyfill in tests).
 */

export type Point = { x: number; y: number };

/** Points sampled per sub path — higher is smoother, 72 is plenty. */
export const MORPH_SAMPLES = 72;

/** Sub path order matters: index N of both arrays morph into each other. */
export const POPCORN_PATHS = [
  // 1. bucket body
  "M 22 44 L 30 78 C 30.6 82.5 33 85 37.5 85 L 62.5 85 C 67 85 69.4 82.5 70 78 L 78 44 Z",
  // 2. left stripe
  "M 36 47 L 45 47 L 42.5 79 L 38.5 79 Z",
  // 3. right stripe
  "M 55 47 L 64 47 L 61.5 79 L 57.5 79 Z",
  // 4. left kernel
  "M 33 27.5 C 37.1 27.5 40.5 30.9 40.5 35 C 40.5 39.1 37.1 42.5 33 42.5 C 28.9 42.5 25.5 39.1 25.5 35 C 25.5 30.9 28.9 27.5 33 27.5 Z",
  // 5. centre kernel
  "M 50 18 C 55 18 59 22 59 27 C 59 32 55 36 50 36 C 45 36 41 32 41 27 C 41 22 45 18 50 18 Z",
  // 6. right kernel
  "M 67 27.5 C 71.1 27.5 74.5 30.9 74.5 35 C 74.5 39.1 71.1 42.5 67 42.5 C 62.9 42.5 59.5 39.1 59.5 35 C 59.5 30.9 62.9 27.5 67 27.5 Z",
];

export const TV_PATHS = [
  // 1. cabinet
  "M 18 24 L 82 24 C 85 24 88 26 88 29 L 88 71 C 88 74 85 76 82 76 L 18 76 C 15 76 12 74 12 71 L 12 29 C 12 26 15 24 18 24 Z",
  // 2. screen
  "M 22 34 L 78 34 C 80 34 81 35 81 37 L 81 63 C 81 65 80 66 78 66 L 22 66 C 20 66 19 65 19 63 L 19 37 C 19 35 20 34 22 34 Z",
  // 3. stand (neck + base)
  "M 44 76 L 56 76 L 56 82 L 70 82 C 72.5 82 74 83 74 85 L 74 87 C 74 88.5 72.5 89 70 89 L 30 89 C 27.5 89 26 88.5 26 87 L 26 85 C 26 83 27.5 82 30 82 L 44 82 Z",
  // 4. left antenna
  "M 32 28 L 36 24 L 20 8 L 16 12 Z",
  // 5. play button
  "M 45 42 L 58 50 L 45 58 Z",
  // 6. right antenna
  "M 68 28 L 64 24 L 80 8 L 84 12 Z",
];

/** Minimal contract the sampler needs from an SVG path element. */
export interface PathSampler {
  setAttribute: (name: string, value: string) => void;
  getTotalLength: () => number;
  getPointAtLength: (length: number) => Point;
}

const round = (value: number): number => Math.round(value * 100) / 100;

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Samples a path into an evenly spaced ring of points using the browser's own
 * SVG geometry engine (`getPointAtLength`).
 */
export const samplePath = (
  sampler: PathSampler,
  d: string,
  samples: number = MORPH_SAMPLES,
): Point[] => {
  sampler.setAttribute("d", d);
  const length = sampler.getTotalLength();
  const points: Point[] = [];

  if (!length || !Number.isFinite(length)) {
    for (let i = 0; i < samples; i++) points.push({ x: 50, y: 50 });
    return points;
  }

  for (let i = 0; i < samples; i++) {
    points.push(sampler.getPointAtLength((i / samples) * length));
  }
  return points;
};

/**
 * Picks the rotation/direction of `to` that best matches `from` so the shapes
 * morph without twisting inside out.
 */
export const alignRing = (from: Point[], to: Point[]): Point[] => {
  const count = from.length;
  let bestOffset = 0;
  let bestDirection = 1;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const direction of [1, -1]) {
    for (let offset = 0; offset < count; offset++) {
      let score = 0;
      for (let i = 0; i < count; i++) {
        const index = direction === 1 ? (i + offset) % count : (count + offset - i) % count;
        const dx = from[i].x - to[index].x;
        const dy = from[i].y - to[index].y;
        score += dx * dx + dy * dy;
        if (score >= bestScore) break;
      }
      if (score < bestScore) {
        bestScore = score;
        bestOffset = offset;
        bestDirection = direction;
      }
    }
  }

  const aligned: Point[] = [];
  for (let i = 0; i < count; i++) {
    const index =
      bestDirection === 1 ? (i + bestOffset) % count : (count + bestOffset - i) % count;
    aligned.push(to[index]);
  }
  return aligned;
};

export const lerpRing = (from: Point[], to: Point[], t: number): Point[] =>
  from.map((point, index) => ({
    x: point.x + (to[index].x - point.x) * t,
    y: point.y + (to[index].y - point.y) * t,
  }));

/** Builds a smooth closed cubic path through the given points (Catmull-Rom). */
export const toSmoothClosedPath = (points: Point[], tension: number = 1): string => {
  const count = points.length;
  if (count < 3) return "";

  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;

  for (let i = 0; i < count; i++) {
    const p0 = points[(i - 1 + count) % count];
    const p1 = points[i];
    const p2 = points[(i + 1) % count];
    const p3 = points[(i + 2) % count];

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(p2.x)} ${round(p2.y)}`;
  }

  return `${d} Z`;
};

/** Interpolated `d` for a single sub path at progress `t` (0 = from, 1 = to). */
export const morphPath = (from: Point[], to: Point[], t: number): string =>
  toSmoothClosedPath(lerpRing(from, to, t));

/** Interpolated `d` for every sub path of an icon pair at progress `t`. */
export const morphIcon = (from: Point[][], to: Point[][], t: number): string[] =>
  from.map((ring, index) => morphPath(ring, to[index], t));
