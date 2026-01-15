// Clinical beam arrangement presets
import { Preset } from '../lib/types';

export const BEAM_PRESETS: Preset[] = [
  {
    id: 'ap-pa',
    name: 'AP/PA',
    description: 'Parallel opposed anterior-posterior',
    icon: '↕️',
    beams: [
      { gantryAngle: 0, weight: 1.0, fieldWidth: 10, energy: '6MV', color: '#3b82f6' },
      { gantryAngle: 180, weight: 1.0, fieldWidth: 10, energy: '6MV', color: '#ef4444' },
    ],
  },
  {
    id: 'lat',
    name: 'Laterals',
    description: 'Parallel opposed lateral beams',
    icon: '↔️',
    beams: [
      { gantryAngle: 90, weight: 1.0, fieldWidth: 10, energy: '6MV', color: '#3b82f6' },
      { gantryAngle: 270, weight: 1.0, fieldWidth: 10, energy: '6MV', color: '#ef4444' },
    ],
  },
  {
    id: '4-field',
    name: '4-Field Box',
    description: 'Classic 4-field technique (pelvis)',
    icon: '⬜',
    beams: [
      { gantryAngle: 0, weight: 1.0, fieldWidth: 12, energy: '10MV', color: '#3b82f6' },
      { gantryAngle: 90, weight: 0.8, fieldWidth: 10, energy: '10MV', color: '#10b981' },
      { gantryAngle: 180, weight: 1.0, fieldWidth: 12, energy: '10MV', color: '#ef4444' },
      { gantryAngle: 270, weight: 0.8, fieldWidth: 10, energy: '10MV', color: '#f59e0b' },
    ],
  },
  {
    id: '3-field-breast',
    name: '3-Field Breast',
    description: 'Tangent pair + supraclav',
    icon: '🎯',
    beams: [
      { gantryAngle: 305, weight: 1.0, fieldWidth: 12, energy: '6MV', color: '#3b82f6' },
      { gantryAngle: 125, weight: 1.0, fieldWidth: 12, energy: '6MV', color: '#10b981' },
      { gantryAngle: 0, weight: 0.6, fieldWidth: 8, energy: '6MV', color: '#ef4444' },
    ],
  },
  {
    id: 'oblique-pair',
    name: 'Oblique Pair',
    description: 'Two oblique beams',
    icon: '⟋',
    beams: [
      { gantryAngle: 45, weight: 1.0, fieldWidth: 8, energy: '6MV', color: '#3b82f6' },
      { gantryAngle: 315, weight: 1.0, fieldWidth: 8, energy: '6MV', color: '#10b981' },
    ],
  },
  {
    id: '5-field',
    name: '5-Field',
    description: 'Equispaced coplanar beams',
    icon: '⭐',
    beams: [
      { gantryAngle: 0, weight: 1.0, fieldWidth: 8, energy: '10MV', color: '#3b82f6' },
      { gantryAngle: 72, weight: 1.0, fieldWidth: 8, energy: '10MV', color: '#10b981' },
      { gantryAngle: 144, weight: 1.0, fieldWidth: 8, energy: '10MV', color: '#ef4444' },
      { gantryAngle: 216, weight: 1.0, fieldWidth: 8, energy: '10MV', color: '#f59e0b' },
      { gantryAngle: 288, weight: 1.0, fieldWidth: 8, energy: '10MV', color: '#8b5cf6' },
    ],
  },
  {
    id: 'vmat-arc',
    name: 'VMAT-style',
    description: '18 equispaced beams (arc simulation)',
    icon: '🌀',
    beams: Array.from({ length: 18 }, (_, i) => ({
      gantryAngle: i * 20,
      weight: 0.5,
      fieldWidth: 6,
      energy: '6MV' as const,
      color: `hsl(${i * 20}, 70%, 50%)`,
    })),
  },
  {
    id: 'wedge-pair',
    name: 'Wedge Pair',
    description: 'Angled beams for wedge effect',
    icon: '⧨',
    beams: [
      { gantryAngle: 30, weight: 1.0, fieldWidth: 10, energy: '6MV', color: '#3b82f6' },
      { gantryAngle: 330, weight: 1.0, fieldWidth: 10, energy: '6MV', color: '#10b981' },
    ],
  },
];

// Beam colors for new beams (cycle through these)
export const BEAM_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#ef4444', // Red
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

export function getNextBeamColor(existingBeams: { color: string }[]): string {
  const usedColors = new Set(existingBeams.map(b => b.color));
  return BEAM_COLORS.find(c => !usedColors.has(c)) || BEAM_COLORS[existingBeams.length % BEAM_COLORS.length];
}
