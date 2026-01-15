'use client';

import { Beam, Energy } from '../lib/types';

interface BeamControlsProps {
  beam: Beam | null;
  onUpdateBeam: (id: string, updates: Partial<Beam>) => void;
  onDeleteBeam: (id: string) => void;
}

export default function BeamControls({ beam, onUpdateBeam, onDeleteBeam }: BeamControlsProps) {
  if (!beam) {
    return (
      <div className="card-dark rounded-xl p-4">
        <p className="text-[var(--foreground-muted)] text-sm text-center">
          Click on the patient perimeter to add a beam,<br />
          or select an existing beam to edit
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-xl p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: beam.color, boxShadow: `0 0 10px ${beam.color}` }}
          />
          <span className="font-medium">Beam at {beam.gantryAngle}°</span>
        </div>
        <button
          onClick={() => onDeleteBeam(beam.id)}
          className="text-[var(--danger)] hover:text-red-400 text-sm px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Gantry Angle */}
      <div>
        <label className="block text-sm text-[var(--foreground-muted)] mb-1">
          Gantry Angle: {beam.gantryAngle}°
        </label>
        <input
          type="range"
          min="0"
          max="359"
          value={beam.gantryAngle}
          onChange={(e) => onUpdateBeam(beam.id, { gantryAngle: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm text-[var(--foreground-muted)] mb-1">
          Weight: {beam.weight.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={beam.weight * 100}
          onChange={(e) => onUpdateBeam(beam.id, { weight: parseInt(e.target.value) / 100 })}
          className="w-full"
        />
      </div>

      {/* Field Width */}
      <div>
        <label className="block text-sm text-[var(--foreground-muted)] mb-1">
          Field Width: {beam.fieldWidth} cm
        </label>
        <input
          type="range"
          min="2"
          max="20"
          value={beam.fieldWidth}
          onChange={(e) => onUpdateBeam(beam.id, { fieldWidth: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Energy */}
      <div>
        <label className="block text-sm text-[var(--foreground-muted)] mb-2">
          Energy
        </label>
        <div className="flex gap-2">
          {(['6MV', '10MV', '18MV'] as Energy[]).map((energy) => (
            <button
              key={energy}
              onClick={() => onUpdateBeam(beam.id, { energy })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                beam.energy === energy
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]/80'
              }`}
            >
              {energy}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
