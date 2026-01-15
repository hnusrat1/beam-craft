'use client';

import { useState, useCallback } from 'react';
import ParticleCanvas from '@/components/Canvas/ParticleCanvas';
import InfoPanel from '@/components/InfoPanel';
import ChallengePanel from '@/components/ChallengePanel';
import { TEACHING_POINTS } from '@/lib/physics';

export default function Home() {
  const [detectorDistance, setDetectorDistance] = useState(3);
  const [completedCount, setCompletedCount] = useState(0);

  const handleDetectorMove = useCallback((distance: number) => {
    setDetectorDistance(distance);
  }, []);

  const handleChallengeComplete = useCallback(() => {
    setCompletedCount(c => c + 1);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="text-amber-400">Inverse²</span> Explorer
        </h1>
        <p className="text-[var(--foreground-muted)] text-sm">
          Master the inverse square law through interactive visualization
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Challenges */}
          <div className="lg:w-80 order-2 lg:order-1">
            <ChallengePanel
              currentDistance={detectorDistance}
              onChallengeComplete={handleChallengeComplete}
            />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 flex flex-col items-center order-1 lg:order-2">
            <ParticleCanvas
              detectorDistance={detectorDistance}
              onDetectorMove={handleDetectorMove}
            />

            {/* Teaching Points */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-[500px]">
              {TEACHING_POINTS.slice(0, 2).map((point, i) => (
                <div key={i} className="card-dark rounded-lg p-3">
                  <div className="text-sm font-semibold text-amber-400 mb-1">
                    {point.title}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {point.description}
                  </div>
                  <div className="text-xs font-mono mt-1 text-[var(--accent)]">
                    {point.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Info */}
          <div className="lg:w-72 order-3">
            <InfoPanel distance={detectorDistance} />

            {/* Key Insight Card */}
            <div className="mt-4 card-dark rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-2">
                Why This Matters
              </h3>
              <div className="text-sm text-[var(--foreground-muted)] space-y-2">
                <p>
                  In <strong>brachytherapy</strong>, dose drops incredibly fast near the source.
                  Moving from 1cm to 2cm cuts dose by 75%!
                </p>
                <p>
                  For <strong>radiation safety</strong>, every step back from a source
                  significantly reduces your exposure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            Drag the blue detector to explore. Complete challenges to master the inverse square law.
          </p>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]/60">
            I = I₀ / r² — The foundation of radiation physics
          </p>
        </footer>
      </main>
    </div>
  );
}
