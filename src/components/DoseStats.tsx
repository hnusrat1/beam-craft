'use client';

interface DoseStatsProps {
  maxDose: number;
  beamCount: number;
}

export default function DoseStats({ maxDose, beamCount }: DoseStatsProps) {
  const maxPercent = Math.round(maxDose * 100);
  const isHotSpot = maxPercent > 107;

  return (
    <div className="card-dark rounded-xl p-4">
      <h3 className="font-medium text-sm text-[var(--foreground-muted)] mb-3">
        Dose Statistics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">Max Dose</p>
          <p className={`text-2xl font-bold ${isHotSpot ? 'text-[var(--danger)]' : 'text-[var(--foreground)]'}`}>
            {maxPercent}%
          </p>
          {isHotSpot && (
            <p className="text-xs text-[var(--danger)]">Hot spot detected</p>
          )}
        </div>
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">Active Beams</p>
          <p className="text-2xl font-bold">{beamCount}</p>
        </div>
      </div>
    </div>
  );
}
