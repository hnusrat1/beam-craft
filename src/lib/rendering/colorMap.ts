// Clinical colorwash mapping for dose visualization

/**
 * Color stops for dose colorwash (clinical convention)
 * Blue (cold) → Green → Yellow → Red (hot)
 */
const COLOR_STOPS: { dose: number; r: number; g: number; b: number }[] = [
  { dose: 0.00, r: 0,   g: 0,   b: 128 },  // Dark blue (no dose)
  { dose: 0.10, r: 0,   g: 0,   b: 255 },  // Blue
  { dose: 0.30, r: 0,   g: 191, b: 255 },  // Light blue
  { dose: 0.50, r: 0,   g: 255, b: 0   },  // Green
  { dose: 0.70, r: 144, g: 238, b: 144 },  // Light green
  { dose: 0.80, r: 255, g: 255, b: 0   },  // Yellow
  { dose: 0.90, r: 255, g: 215, b: 0   },  // Gold
  { dose: 0.95, r: 255, g: 165, b: 0   },  // Orange
  { dose: 1.00, r: 255, g: 69,  b: 0   },  // Orange-red (prescription)
  { dose: 1.07, r: 255, g: 0,   b: 0   },  // Red (hot spot)
  { dose: 1.20, r: 255, g: 0,   b: 128 },  // Magenta (very hot)
];

/**
 * Interpolate between two color stops
 */
function interpolateColor(
  dose: number,
  stop1: typeof COLOR_STOPS[0],
  stop2: typeof COLOR_STOPS[0]
): { r: number; g: number; b: number } {
  const t = (dose - stop1.dose) / (stop2.dose - stop1.dose);
  return {
    r: Math.round(stop1.r + t * (stop2.r - stop1.r)),
    g: Math.round(stop1.g + t * (stop2.g - stop1.g)),
    b: Math.round(stop1.b + t * (stop2.b - stop1.b)),
  };
}

/**
 * Get color for a dose value (0-1+ range, normalized to prescription)
 */
export function getDoseColor(dose: number): { r: number; g: number; b: number } {
  if (dose <= 0) {
    return { r: 0, g: 0, b: 0 }; // No dose = black
  }

  // Find surrounding color stops
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (dose >= COLOR_STOPS[i].dose && dose <= COLOR_STOPS[i + 1].dose) {
      return interpolateColor(dose, COLOR_STOPS[i], COLOR_STOPS[i + 1]);
    }
  }

  // Above max - return hottest color
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  return { r: last.r, g: last.g, b: last.b };
}

/**
 * Get color as CSS string
 */
export function getDoseColorCSS(dose: number, alpha: number = 1): string {
  const { r, g, b } = getDoseColor(dose);
  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Create ImageData colorwash from dose grid
 */
export function createColorwashImageData(
  doseData: Float32Array,
  width: number,
  height: number,
  opacity: number = 0.7
): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < doseData.length; i++) {
    const dose = doseData[i];
    const pixelIdx = i * 4;

    if (dose > 0.05) { // Only show dose above ~5%
      const color = getDoseColor(dose);
      data[pixelIdx] = color.r;
      data[pixelIdx + 1] = color.g;
      data[pixelIdx + 2] = color.b;
      data[pixelIdx + 3] = Math.round(opacity * 255);
    } else {
      // Transparent for low/no dose
      data[pixelIdx] = 0;
      data[pixelIdx + 1] = 0;
      data[pixelIdx + 2] = 0;
      data[pixelIdx + 3] = 0;
    }
  }

  return imageData;
}

/**
 * Lookup table for fast color mapping (pre-computed)
 */
let colorLUT: Uint8Array | null = null;

function initColorLUT(): Uint8Array {
  if (colorLUT) return colorLUT;

  // 256 levels, 4 channels (RGBA)
  colorLUT = new Uint8Array(256 * 4);

  for (let i = 0; i < 256; i++) {
    const dose = i / 255 * 1.2; // Scale to 0-1.2 range
    const color = getDoseColor(dose);
    colorLUT[i * 4] = color.r;
    colorLUT[i * 4 + 1] = color.g;
    colorLUT[i * 4 + 2] = color.b;
    colorLUT[i * 4 + 3] = dose > 0.05 ? 255 : 0;
  }

  return colorLUT;
}

/**
 * Fast colorwash using LUT (for real-time updates)
 */
export function createColorwashFast(
  doseData: Float32Array,
  width: number,
  height: number,
  opacity: number = 0.7
): ImageData {
  const lut = initColorLUT();
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  const alphaScale = opacity;

  for (let i = 0; i < doseData.length; i++) {
    // Map dose (0-1.2) to LUT index (0-255)
    const lutIdx = Math.min(255, Math.floor(doseData[i] / 1.2 * 255)) * 4;
    const pixelIdx = i * 4;

    data[pixelIdx] = lut[lutIdx];
    data[pixelIdx + 1] = lut[lutIdx + 1];
    data[pixelIdx + 2] = lut[lutIdx + 2];
    data[pixelIdx + 3] = Math.round(lut[lutIdx + 3] * alphaScale);
  }

  return imageData;
}
