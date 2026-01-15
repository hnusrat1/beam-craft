'use client';

import { calculateIntensity, formatIntensity, formatDistance } from '@/lib/physics';

interface InfoPanelProps {
  distance: number;
  referenceDistance?: number;
}

export default function InfoPanel({ distance, referenceDistance = 1 }: InfoPanelProps) {
  const intensity = calculateIntensity(distance, referenceDistance);
  const intensityPercent = intensity * 100;

  // Color based on intensity (hot to cold)
  const getIntensityColor = () => {
    if (intensityPercent > 100) return '#ef4444'; // red
    if (intensityPercent > 50) return '#f59e0b';  // amber
    if (intensityPercent > 25) return '#eab308';  // yellow
    if (intensityPercent > 10) return '#22c55e';  // green
    return '#3b82f6'; // blue
  };

  return (
    <div className="card-dark rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-[var(--foreground-muted)]">
        Measurements
      </h2>

      {/* Distance Display */}
      <div className="space-y-1">
        <div className="text-sm text-[var(--foreground-muted)]">Distance</div>
        <div className="text-3xl font-bold font-mono">
          {formatDistance(distance)}
        </div>
      </div>

      {/* Intensity Display */}
      <div className="space-y-1">
        <div className="text-sm text-[var(--foreground-muted)]">
          Relative Intensity
        </div>
        <div
          className="text-4xl font-bold font-mono transition-colors"
          style={{ color: getIntensityColor() }}
        >
          {formatIntensity(intensity)}
        </div>
      </div>

      {/* The Math */}
      <div className="pt-3 border-t border-[var(--border)]">
        <div className="text-sm text-[var(--foreground-muted)] mb-2">The Math</div>
        <div className="font-mono text-sm bg-black/30 p-3 rounded-lg">
          <div className="text-[var(--accent)]">I = I₀ / r²</div>
          <div className="mt-2 text-[var(--foreground-muted)]">
            I = 1 / {distance.toFixed(2)}²
          </div>
          <div className="text-[var(--foreground)]">
            I = 1 / {(distance * distance).toFixed(2)}
          </div>
          <div className="mt-1" style={{ color: getIntensityColor() }}>
            I = {intensity.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="pt-3 border-t border-[var(--border)]">
        <div className="text-sm text-[var(--foreground-muted)] mb-2">Quick Reference</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-black/20 p-2 rounded">
            <div className="text-[var(--foreground-muted)]">1 cm</div>
            <div className="font-mono font-bold">100%</div>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <div className="text-[var(--foreground-muted)]">2 cm</div>
            <div className="font-mono font-bold">25%</div>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <div className="text-[var(--foreground-muted)]">3 cm</div>
            <div className="font-mono font-bold">11.1%</div>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <div className="text-[var(--foreground-muted)]">5 cm</div>
            <div className="font-mono font-bold">4%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
