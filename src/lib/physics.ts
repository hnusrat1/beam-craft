// Inverse Square Law Physics
// I = I₀ / r²

/**
 * Calculate intensity at distance r, relative to intensity at reference distance
 * @param distance - Current distance from source
 * @param referenceDistance - Reference distance (default 1cm)
 * @returns Relative intensity (1.0 at reference distance)
 */
export function calculateIntensity(distance: number, referenceDistance: number = 1): number {
  if (distance <= 0) return Infinity;
  return (referenceDistance * referenceDistance) / (distance * distance);
}

/**
 * Calculate distance needed for a target intensity
 * @param targetIntensity - Desired intensity relative to reference
 * @param referenceDistance - Reference distance (default 1cm)
 * @returns Distance needed to achieve target intensity
 */
export function calculateDistanceForIntensity(targetIntensity: number, referenceDistance: number = 1): number {
  if (targetIntensity <= 0) return Infinity;
  return referenceDistance / Math.sqrt(targetIntensity);
}

/**
 * Calculate dose rate at distance (clinical units)
 * @param distance - Distance in cm
 * @param doseRateAt1cm - Dose rate at 1cm (e.g., cGy/hr)
 * @returns Dose rate at given distance
 */
export function calculateDoseRate(distance: number, doseRateAt1cm: number): number {
  return doseRateAt1cm / (distance * distance);
}

/**
 * Format intensity as percentage
 */
export function formatIntensity(intensity: number): string {
  if (intensity > 1000) return '>1000%';
  return `${(intensity * 100).toFixed(1)}%`;
}

/**
 * Format distance with units
 */
export function formatDistance(distance: number): string {
  if (distance >= 100) {
    return `${(distance / 100).toFixed(2)} m`;
  }
  return `${distance.toFixed(2)} cm`;
}

// Clinical reference data
export const CLINICAL_EXAMPLES = {
  // Ir-192 HDR source characteristics
  ir192: {
    name: 'Ir-192 HDR',
    description: 'High Dose Rate Brachytherapy Source',
    // Typical air-kerma rate constant
    doseRateConstant: 4.69, // cGy·cm²/hr per Ci
    halfLife: 73.8, // days
    // Example dose rates at various distances (for 10 Ci source)
    exampleDoseRates: [
      { distance: 1, rate: '46.9 cGy/hr' },
      { distance: 2, rate: '11.7 cGy/hr' },
      { distance: 3, rate: '5.2 cGy/hr' },
      { distance: 5, rate: '1.9 cGy/hr' },
    ],
  },
  // Fluoroscopy safety distances
  fluoroscopy: {
    name: 'Fluoroscopy',
    description: 'C-arm scatter radiation',
    safetyNote: 'Scatter at 1m ≈ 0.1% of primary beam',
    // Standing distance recommendations
    distances: [
      { distance: 100, label: '1m from table', reduction: '1x (reference)' },
      { distance: 200, label: '2m from table', reduction: '4x reduction' },
      { distance: 300, label: '3m from table', reduction: '9x reduction' },
    ],
  },
};

// Key teaching points
export const TEACHING_POINTS = [
  {
    title: 'Double Distance = Quarter Intensity',
    description: 'When you double your distance, intensity drops to 1/4',
    example: '1cm → 2cm: 100% → 25%',
  },
  {
    title: 'Triple Distance = Ninth Intensity',
    description: 'When you triple your distance, intensity drops to 1/9',
    example: '1cm → 3cm: 100% → 11.1%',
  },
  {
    title: '√2 Rule',
    description: 'To halve the intensity, multiply distance by √2 ≈ 1.41',
    example: '1cm → 1.41cm: 100% → 50%',
  },
  {
    title: 'Every Step Counts',
    description: 'Close to source, small movements make huge differences',
    example: '1cm → 2cm saves 75% dose, but 10cm → 11cm only saves 17%',
  },
];
