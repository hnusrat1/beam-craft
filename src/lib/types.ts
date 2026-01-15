// Core types for BeamCraft

export type Energy = '6MV' | '10MV' | '18MV';

export interface Beam {
  id: string;
  gantryAngle: number;      // 0-360 degrees (0 = superior/12 o'clock)
  weight: number;           // 0-2.0 (1.0 = normalized)
  fieldWidth: number;       // cm (2-20)
  energy: Energy;
  color: string;
  isSelected: boolean;
}

export interface DoseGrid {
  width: number;            // Grid dimensions
  height: number;
  data: Float32Array;       // Dose values (normalized 0-1)
  maxDose: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface IsodoseLine {
  level: number;            // Percentage (100, 95, 90, etc.)
  color: string;
  contours: Point[][];      // Multiple closed contours
}

export interface ViewSettings {
  showColorwash: boolean;
  showIsodoseLines: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  colorwashOpacity: number;
  isodoseLevels: number[];
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  beams: Omit<Beam, 'id' | 'isSelected'>[];
}

// Energy parameters for PDD calculation
// mu values derived from clinical PDD tables: mu = -ln(PDD) / (depth - dmax)
export const ENERGY_PARAMS: Record<Energy, { dmax: number; mu: number }> = {
  '6MV': { dmax: 1.5, mu: 0.049 },   // PDD(10cm)~67%, PDD(20cm)~40%
  '10MV': { dmax: 2.5, mu: 0.044 },  // PDD(10cm)~72%, PDD(20cm)~46%
  '18MV': { dmax: 3.5, mu: 0.036 },  // PDD(10cm)~79%, PDD(20cm)~54%
};

// Standard isodose colors (clinical convention)
export const ISODOSE_COLORS: Record<number, string> = {
  107: '#ff0000',  // Hot (red) - overdose
  100: '#ff4500',  // Prescription (orange-red)
  95:  '#ffa500',  // Orange
  90:  '#ffd700',  // Gold
  80:  '#ffff00',  // Yellow
  70:  '#90ee90',  // Light green
  50:  '#00ff00',  // Green
  30:  '#00bfff',  // Light blue
  10:  '#0000ff',  // Blue (cold)
};

// Default isodose levels to display
export const DEFAULT_ISODOSE_LEVELS = [95, 90, 80, 70, 50, 30];

// Canvas/physics constants
export const CANVAS_SIZE = 500;           // pixels
export const PATIENT_RADIUS_CM = 15;      // cm (30cm diameter patient)
export const SCALE = CANVAS_SIZE / (PATIENT_RADIUS_CM * 2); // px per cm
export const GRID_RESOLUTION = 2;         // pixels per grid cell (250x250 grid)
