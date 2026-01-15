// Single beam dose model with clinically accurate PDD and lateral profiles
import { Energy, ENERGY_PARAMS, PATIENT_RADIUS_CM } from '../types';

/**
 * Percent Depth Dose (PDD) - models dose deposition along central axis
 *
 * Includes:
 * - Build-up region (skin-sparing effect)
 * - dmax (depth of maximum dose)
 * - Exponential attenuation beyond dmax
 */
export function calculatePDD(depth: number, energy: Energy): number {
  const { dmax, mu } = ENERGY_PARAMS[energy];

  if (depth < 0) return 0;

  // Build-up region: quadratic rise to dmax
  if (depth <= dmax) {
    // Normalized so PDD(dmax) = 1.0
    const ratio = depth / dmax;
    return ratio * (2 - ratio); // Quadratic build-up curve
  }

  // Beyond dmax: exponential attenuation
  const beyondDmax = depth - dmax;
  return Math.exp(-mu * beyondDmax);
}

/**
 * Off-Axis Ratio (OAR) - models lateral dose profile
 *
 * Uses a combination of:
 * - Flat central region (within field width)
 * - Penumbra falloff (sigmoid/Gaussian transition)
 */
export function calculateOAR(
  offAxisDistance: number,
  fieldWidth: number,
  energy: Energy
): number {
  const halfWidth = fieldWidth / 2;

  // Penumbra width increases slightly with energy (higher scatter)
  const penumbraWidth = 0.8 + (energy === '18MV' ? 0.2 : energy === '10MV' ? 0.1 : 0);

  // Distance from field edge
  const distFromEdge = Math.abs(offAxisDistance) - halfWidth;

  if (distFromEdge <= 0) {
    // Inside field: slight horn effect at edges (more pronounced for higher energies)
    const hornFactor = energy === '6MV' ? 0.02 : energy === '10MV' ? 0.03 : 0.04;
    const normalizedDist = Math.abs(offAxisDistance) / halfWidth;
    return 1.0 + hornFactor * normalizedDist * normalizedDist;
  }

  // Penumbra region: sigmoid falloff
  // Using error function approximation for smooth transition
  const sigma = penumbraWidth / 2.355; // Convert FWHM to sigma
  return 0.5 * (1 - erf(distFromEdge / (sigma * Math.sqrt(2))));
}

/**
 * Error function approximation (Abramowitz and Stegun)
 */
function erf(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Inverse Square Law correction
 * Accounts for dose falloff with distance from source
 *
 * Reference: 100cm SAD (Source-to-Axis Distance)
 */
export function calculateISL(depth: number): number {
  const SAD = 100; // cm
  const SSD = SAD - PATIENT_RADIUS_CM; // Source-to-surface distance
  const distance = SSD + depth;
  return (SAD * SAD) / (distance * distance);
}

/**
 * Calculate dose at a point from a single beam
 *
 * Coordinate system:
 * - Origin at patient center (isocenter)
 * - Beam enters from gantry angle (0° = superior/12 o'clock)
 * - Depth measured from patient surface along beam axis
 * - Off-axis measured perpendicular to beam axis
 */
export function calculateBeamDose(
  x: number,           // cm from isocenter (positive = right)
  y: number,           // cm from isocenter (positive = inferior)
  gantryAngle: number, // degrees (0 = superior)
  fieldWidth: number,  // cm
  energy: Energy,
  weight: number = 1.0
): number {
  // Convert gantry angle to radians (0° = coming from top)
  const angleRad = (gantryAngle * Math.PI) / 180;

  // Unit vector pointing INTO patient (beam direction)
  // For gantry=0° (beam from superior), beam points toward inferior (+Y)
  const beamDirX = Math.sin(angleRad);
  const beamDirY = Math.cos(angleRad);

  // Entry point on patient surface (radius = PATIENT_RADIUS_CM)
  const entryX = -PATIENT_RADIUS_CM * beamDirX;
  const entryY = -PATIENT_RADIUS_CM * beamDirY;

  // Vector from entry point to calculation point
  const toPointX = x - entryX;
  const toPointY = y - entryY;

  // Depth along beam axis (dot product with beam direction)
  const depth = toPointX * beamDirX + toPointY * beamDirY;

  // Off-axis distance (perpendicular to beam)
  const offAxis = toPointX * beamDirY - toPointY * beamDirX;

  // Check if point is within patient
  const distFromCenter = Math.sqrt(x * x + y * y);
  if (distFromCenter > PATIENT_RADIUS_CM) {
    return 0;
  }

  // Check if point is "downstream" of beam entry
  if (depth < 0) {
    return 0;
  }

  // Calculate dose components
  const pdd = calculatePDD(depth, energy);
  const oar = calculateOAR(offAxis, fieldWidth, energy);

  // Note: PDD already includes inverse square effects at reference SSD
  // Do NOT apply additional ISL correction (would double-count)
  return weight * pdd * oar;
}
