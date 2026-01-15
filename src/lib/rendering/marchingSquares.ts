// Marching Squares algorithm for isodose contour generation
import { Point, IsodoseLine, DoseGrid } from '../types';

/**
 * Edge interpolation lookup
 * For each of 16 cases, specifies which edges to draw between
 * Edges: 0=top, 1=right, 2=bottom, 3=left
 */
const EDGE_TABLE: number[][] = [
  [],           // 0: all below
  [3, 2],       // 1: bottom-left above
  [2, 1],       // 2: bottom-right above
  [3, 1],       // 3: bottom above
  [0, 1],       // 4: top-right above
  [3, 2, 0, 1], // 5: saddle (bottom-left, top-right)
  [0, 2],       // 6: right above
  [3, 0],       // 7: all except top-left
  [0, 3],       // 8: top-left above
  [0, 2],       // 9: left above
  [0, 1, 2, 3], // 10: saddle (top-left, bottom-right)
  [0, 1],       // 11: all except top-right
  [3, 1],       // 12: top above
  [2, 1],       // 13: all except bottom-right
  [3, 2],       // 14: all except bottom-left
  [],           // 15: all above
];

/**
 * Linear interpolation between two points based on threshold
 */
function interpolate(
  x1: number, y1: number, v1: number,
  x2: number, y2: number, v2: number,
  threshold: number
): Point {
  if (Math.abs(v2 - v1) < 0.0001) {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  }
  const t = (threshold - v1) / (v2 - v1);
  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  };
}

/**
 * Get edge midpoint with interpolation
 */
function getEdgePoint(
  grid: DoseGrid,
  gx: number, gy: number,
  edge: number,
  threshold: number
): Point {
  const v00 = getValue(grid, gx, gy);
  const v10 = getValue(grid, gx + 1, gy);
  const v01 = getValue(grid, gx, gy + 1);
  const v11 = getValue(grid, gx + 1, gy + 1);

  switch (edge) {
    case 0: // Top edge
      return interpolate(gx, gy, v00, gx + 1, gy, v10, threshold);
    case 1: // Right edge
      return interpolate(gx + 1, gy, v10, gx + 1, gy + 1, v11, threshold);
    case 2: // Bottom edge
      return interpolate(gx, gy + 1, v01, gx + 1, gy + 1, v11, threshold);
    case 3: // Left edge
      return interpolate(gx, gy, v00, gx, gy + 1, v01, threshold);
    default:
      return { x: gx + 0.5, y: gy + 0.5 };
  }
}

/**
 * Get grid value with boundary checking
 */
function getValue(grid: DoseGrid, gx: number, gy: number): number {
  if (gx < 0 || gx >= grid.width || gy < 0 || gy >= grid.height) {
    return 0;
  }
  return grid.data[gy * grid.width + gx];
}

/**
 * Generate contour segments using marching squares
 */
export function generateContourSegments(
  grid: DoseGrid,
  threshold: number
): { start: Point; end: Point }[] {
  const segments: { start: Point; end: Point }[] = [];

  for (let gy = 0; gy < grid.height - 1; gy++) {
    for (let gx = 0; gx < grid.width - 1; gx++) {
      // Get corner values
      const v00 = getValue(grid, gx, gy) >= threshold ? 1 : 0;
      const v10 = getValue(grid, gx + 1, gy) >= threshold ? 1 : 0;
      const v01 = getValue(grid, gx, gy + 1) >= threshold ? 1 : 0;
      const v11 = getValue(grid, gx + 1, gy + 1) >= threshold ? 1 : 0;

      // Calculate case index (0-15)
      const caseIndex = v00 | (v10 << 1) | (v11 << 2) | (v01 << 3);

      // Get edges to draw
      const edges = EDGE_TABLE[caseIndex];
      if (edges.length === 0) continue;

      // Handle saddle cases (5 and 10) - use center value to disambiguate
      if (caseIndex === 5 || caseIndex === 10) {
        const centerValue = (getValue(grid, gx, gy) + getValue(grid, gx + 1, gy) +
                           getValue(grid, gx, gy + 1) + getValue(grid, gx + 1, gy + 1)) / 4;
        const centerAbove = centerValue >= threshold;

        if (caseIndex === 5) {
          if (centerAbove) {
            // Connect horizontally
            segments.push({
              start: getEdgePoint(grid, gx, gy, 3, threshold),
              end: getEdgePoint(grid, gx, gy, 0, threshold)
            });
            segments.push({
              start: getEdgePoint(grid, gx, gy, 2, threshold),
              end: getEdgePoint(grid, gx, gy, 1, threshold)
            });
          } else {
            // Connect vertically
            segments.push({
              start: getEdgePoint(grid, gx, gy, 3, threshold),
              end: getEdgePoint(grid, gx, gy, 2, threshold)
            });
            segments.push({
              start: getEdgePoint(grid, gx, gy, 0, threshold),
              end: getEdgePoint(grid, gx, gy, 1, threshold)
            });
          }
        } else { // caseIndex === 10
          if (centerAbove) {
            segments.push({
              start: getEdgePoint(grid, gx, gy, 0, threshold),
              end: getEdgePoint(grid, gx, gy, 1, threshold)
            });
            segments.push({
              start: getEdgePoint(grid, gx, gy, 2, threshold),
              end: getEdgePoint(grid, gx, gy, 3, threshold)
            });
          } else {
            segments.push({
              start: getEdgePoint(grid, gx, gy, 0, threshold),
              end: getEdgePoint(grid, gx, gy, 3, threshold)
            });
            segments.push({
              start: getEdgePoint(grid, gx, gy, 1, threshold),
              end: getEdgePoint(grid, gx, gy, 2, threshold)
            });
          }
        }
      } else {
        // Normal case: draw line between edge pairs
        for (let i = 0; i < edges.length; i += 2) {
          segments.push({
            start: getEdgePoint(grid, gx, gy, edges[i], threshold),
            end: getEdgePoint(grid, gx, gy, edges[i + 1], threshold)
          });
        }
      }
    }
  }

  return segments;
}

/**
 * Connect segments into closed contours
 */
function connectSegments(segments: { start: Point; end: Point }[]): Point[][] {
  if (segments.length === 0) return [];

  const contours: Point[][] = [];
  const used = new Set<number>();
  const tolerance = 0.5; // Grid cells

  function pointsClose(p1: Point, p2: Point): boolean {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }

  function findConnecting(point: Point, exclude: number): number {
    for (let i = 0; i < segments.length; i++) {
      if (used.has(i) || i === exclude) continue;
      if (pointsClose(segments[i].start, point) || pointsClose(segments[i].end, point)) {
        return i;
      }
    }
    return -1;
  }

  for (let startIdx = 0; startIdx < segments.length; startIdx++) {
    if (used.has(startIdx)) continue;

    const contour: Point[] = [];
    let current = startIdx;
    let currentEnd = segments[current].end;

    // Add start point
    contour.push({ ...segments[current].start });
    contour.push({ ...currentEnd });
    used.add(current);

    // Follow chain
    let next = findConnecting(currentEnd, current);
    while (next !== -1 && !used.has(next)) {
      used.add(next);
      const seg = segments[next];

      // Determine which end connects
      if (pointsClose(seg.start, currentEnd)) {
        contour.push({ ...seg.end });
        currentEnd = seg.end;
      } else {
        contour.push({ ...seg.start });
        currentEnd = seg.start;
      }

      next = findConnecting(currentEnd, next);
    }

    if (contour.length >= 3) {
      contours.push(contour);
    }
  }

  return contours;
}

/**
 * Generate isodose line for a given dose level
 */
export function generateIsodoseLine(
  grid: DoseGrid,
  level: number,
  color: string
): IsodoseLine {
  // Convert percentage to fraction
  const threshold = level / 100;
  const segments = generateContourSegments(grid, threshold);
  const contours = connectSegments(segments);

  return {
    level,
    color,
    contours
  };
}

/**
 * Generate all isodose lines for given levels
 */
export function generateAllIsodoseLines(
  grid: DoseGrid,
  levels: number[],
  colors: Record<number, string>
): IsodoseLine[] {
  return levels.map(level =>
    generateIsodoseLine(grid, level, colors[level] || '#ffffff')
  ).filter(line => line.contours.length > 0);
}
