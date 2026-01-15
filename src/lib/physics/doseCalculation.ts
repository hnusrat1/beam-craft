// Dose grid calculation - multi-beam summation
import { Beam, DoseGrid, PATIENT_RADIUS_CM, CANVAS_SIZE, GRID_RESOLUTION } from '../types';
import { calculateBeamDose } from './beamModel';

// Grid dimensions
const GRID_SIZE = Math.floor(CANVAS_SIZE / GRID_RESOLUTION);
const CM_PER_PIXEL = (PATIENT_RADIUS_CM * 2) / CANVAS_SIZE;
const CM_PER_CELL = CM_PER_PIXEL * GRID_RESOLUTION;

/**
 * Calculate the full dose grid for all beams
 * Returns normalized dose values (0-1 range, where 1 = prescription dose)
 */
export function calculateDoseGrid(beams: Beam[]): DoseGrid {
  const data = new Float32Array(GRID_SIZE * GRID_SIZE);
  let maxDose = 0;

  // If no beams, return empty grid
  if (beams.length === 0) {
    return { width: GRID_SIZE, height: GRID_SIZE, data, maxDose: 0 };
  }

  // Calculate dose at each grid point
  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      // Convert grid coords to cm (origin at center)
      const x = (gx - GRID_SIZE / 2 + 0.5) * CM_PER_CELL;
      const y = (gy - GRID_SIZE / 2 + 0.5) * CM_PER_CELL;

      // Check if inside patient
      const dist = Math.sqrt(x * x + y * y);
      if (dist > PATIENT_RADIUS_CM) {
        continue;
      }

      // Sum dose from all beams
      let totalDose = 0;
      for (const beam of beams) {
        totalDose += calculateBeamDose(
          x, y,
          beam.gantryAngle,
          beam.fieldWidth,
          beam.energy,
          beam.weight
        );
      }

      const idx = gy * GRID_SIZE + gx;
      data[idx] = totalDose;
      maxDose = Math.max(maxDose, totalDose);
    }
  }

  // Normalize to prescription dose (max dose = 1.0 for display purposes)
  // Note: We keep actual values for hot spot detection

  return { width: GRID_SIZE, height: GRID_SIZE, data, maxDose };
}

/**
 * Normalize dose grid to percentage of prescription dose
 * Prescription is typically the isocenter dose or a specified level
 */
export function normalizeDoseGrid(grid: DoseGrid, prescriptionDose?: number): DoseGrid {
  const prescription = prescriptionDose ?? grid.maxDose;

  if (prescription === 0) {
    return grid;
  }

  const normalizedData = new Float32Array(grid.data.length);
  for (let i = 0; i < grid.data.length; i++) {
    normalizedData[i] = grid.data[i] / prescription;
  }

  return {
    ...grid,
    data: normalizedData,
    maxDose: grid.maxDose / prescription
  };
}

/**
 * Get dose at isocenter (center of patient)
 * Used for prescription normalization
 */
export function getIsocenterDose(beams: Beam[]): number {
  let totalDose = 0;
  for (const beam of beams) {
    totalDose += calculateBeamDose(
      0, 0, // Isocenter
      beam.gantryAngle,
      beam.fieldWidth,
      beam.energy,
      beam.weight
    );
  }
  return totalDose;
}

/**
 * Get dose value at a specific grid position
 */
export function getDoseAtGridPoint(grid: DoseGrid, gx: number, gy: number): number {
  if (gx < 0 || gx >= grid.width || gy < 0 || gy >= grid.height) {
    return 0;
  }
  return grid.data[gy * grid.width + gx];
}

/**
 * Get dose value at physical coordinates (cm)
 */
export function getDoseAtPoint(grid: DoseGrid, x: number, y: number): number {
  const gx = Math.floor((x / CM_PER_CELL) + grid.width / 2);
  const gy = Math.floor((y / CM_PER_CELL) + grid.height / 2);
  return getDoseAtGridPoint(grid, gx, gy);
}

/**
 * Detect hot spots (regions >107% of prescription)
 * Returns array of grid indices where hot spots occur
 */
export function detectHotSpots(grid: DoseGrid, threshold: number = 1.07): number[] {
  const hotSpots: number[] = [];
  for (let i = 0; i < grid.data.length; i++) {
    if (grid.data[i] > threshold) {
      hotSpots.push(i);
    }
  }
  return hotSpots;
}

/**
 * Calculate dose statistics for display
 */
export function calculateDoseStats(grid: DoseGrid): {
  min: number;
  max: number;
  mean: number;
  hotSpotPercent: number;
} {
  let min = Infinity;
  let max = 0;
  let sum = 0;
  let count = 0;
  let hotSpotCount = 0;

  for (let i = 0; i < grid.data.length; i++) {
    const dose = grid.data[i];
    if (dose > 0) {
      min = Math.min(min, dose);
      max = Math.max(max, dose);
      sum += dose;
      count++;
      if (dose > 1.07) hotSpotCount++;
    }
  }

  return {
    min: count > 0 ? min : 0,
    max,
    mean: count > 0 ? sum / count : 0,
    hotSpotPercent: count > 0 ? (hotSpotCount / count) * 100 : 0
  };
}

// Export grid constants for use in rendering
export { GRID_SIZE, CM_PER_CELL, CM_PER_PIXEL };
