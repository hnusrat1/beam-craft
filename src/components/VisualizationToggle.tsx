'use client';

import { ViewSettings } from '../lib/types';

interface VisualizationToggleProps {
  settings: ViewSettings;
  onUpdateSettings: (updates: Partial<ViewSettings>) => void;
}

export default function VisualizationToggle({ settings, onUpdateSettings }: VisualizationToggleProps) {
  return (
    <div className="card-dark rounded-xl p-4 space-y-4">
      <h3 className="font-medium text-sm text-[var(--foreground-muted)]">
        Visualization
      </h3>

      {/* Toggle buttons */}
      <div className="space-y-2">
        <ToggleRow
          label="Colorwash"
          checked={settings.showColorwash}
          onChange={(v) => onUpdateSettings({ showColorwash: v })}
        />
        <ToggleRow
          label="Isodose Lines"
          checked={settings.showIsodoseLines}
          onChange={(v) => onUpdateSettings({ showIsodoseLines: v })}
        />
        <ToggleRow
          label="Grid"
          checked={settings.showGrid}
          onChange={(v) => onUpdateSettings({ showGrid: v })}
        />
        <ToggleRow
          label="Crosshair"
          checked={settings.showCrosshair}
          onChange={(v) => onUpdateSettings({ showCrosshair: v })}
        />
      </div>

      {/* Opacity slider */}
      {settings.showColorwash && (
        <div>
          <label className="block text-sm text-[var(--foreground-muted)] mb-1">
            Colorwash Opacity: {Math.round(settings.colorwashOpacity * 100)}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.colorwashOpacity * 100}
            onChange={(e) => onUpdateSettings({ colorwashOpacity: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
        </div>
      )}

      {/* Isodose legend */}
      {settings.showIsodoseLines && (
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--foreground-muted)] mb-2">Isodose Levels</p>
          <div className="flex flex-wrap gap-2">
            {settings.isodoseLevels.map((level) => (
              <span
                key={level}
                className={`text-xs px-2 py-0.5 rounded isodose-${level}`}
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                {level}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--background-tertiary)]'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
