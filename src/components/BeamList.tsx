'use client';

import { Beam } from '../lib/types';

interface BeamListProps {
  beams: Beam[];
  selectedBeamId: string | null;
  onSelectBeam: (id: string | null) => void;
  onDeleteBeam: (id: string) => void;
  onClearAll: () => void;
}

export default function BeamList({ beams, selectedBeamId, onSelectBeam, onDeleteBeam, onClearAll }: BeamListProps) {
  if (beams.length === 0) {
    return (
      <div className="card-dark rounded-xl p-4">
        <p className="text-[var(--foreground-muted)] text-sm text-center">
          No beams added yet
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-[var(--foreground-muted)]">
          Active Beams ({beams.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs text-[var(--foreground-muted)] hover:text-[var(--danger)] transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {beams.map((beam) => (
          <div
            key={beam.id}
            onClick={() => onSelectBeam(beam.id)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
              selectedBeamId === beam.id
                ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/50'
                : 'bg-[var(--background-tertiary)]/50 hover:bg-[var(--background-tertiary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: beam.color }}
              />
              <span className="text-sm">{beam.gantryAngle}°</span>
              <span className="text-xs text-[var(--foreground-muted)]">
                {beam.energy} · w={beam.weight.toFixed(1)} · {beam.fieldWidth}cm
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBeam(beam.id);
              }}
              className="text-[var(--foreground-muted)] hover:text-[var(--danger)] p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
