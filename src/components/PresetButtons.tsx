'use client';

import { BEAM_PRESETS } from '../data/presets';

interface PresetButtonsProps {
  onLoadPreset: (presetId: string) => void;
}

export default function PresetButtons({ onLoadPreset }: PresetButtonsProps) {
  return (
    <div className="card-dark rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-sm text-[var(--foreground-muted)]">
        Presets
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {BEAM_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset.id)}
            className="text-left p-2 rounded-lg bg-[var(--background-tertiary)]/50 hover:bg-[var(--background-tertiary)] transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{preset.icon}</span>
              <div>
                <div className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors">
                  {preset.name}
                </div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  {preset.beams.length} beam{preset.beams.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
