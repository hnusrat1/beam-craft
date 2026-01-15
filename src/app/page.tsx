'use client';

import { useState, useCallback } from 'react';
import ParticleCanvas from '@/components/Canvas/ParticleCanvas';
import InfoPanel from '@/components/InfoPanel';
import ChallengePanel from '@/components/ChallengePanel';

export default function Home() {
  const [detectorDistance, setDetectorDistance] = useState(3);

  const handleDetectorMove = useCallback((distance: number) => {
    setDetectorDistance(distance);
  }, []);

  const handleChallengeComplete = useCallback(() => {
    // Could track stats here
  }, []);

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
          <span className="text-amber-400">Inverse²</span> Explorer
        </h1>
        <p className="text-[var(--foreground-muted)] text-xs md:text-sm">
          Master the inverse square law interactively
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* Mobile: Canvas + Info stacked */}
          {/* Desktop: Left sidebar */}
          <div className="hidden lg:block lg:w-80 order-1">
            <ChallengePanel
              currentDistance={detectorDistance}
              onChallengeComplete={handleChallengeComplete}
            />
          </div>

          {/* Center - Canvas + Mobile Info */}
          <div className="flex-1 order-1 lg:order-2">
            <ParticleCanvas
              detectorDistance={detectorDistance}
              onDetectorMove={handleDetectorMove}
            />

            {/* Mobile-only compact info */}
            <div className="lg:hidden mt-4">
              <InfoPanel distance={detectorDistance} />
            </div>

            {/* Teaching tip - mobile only */}
            <div className="lg:hidden mt-3 card-dark rounded-lg p-3 text-center">
              <p className="text-xs text-[var(--foreground-muted)]">
                <span className="text-amber-400 font-semibold">Key Rule:</span> Double the distance = Quarter the intensity
              </p>
            </div>
          </div>

          {/* Right Panel - Desktop only */}
          <div className="hidden lg:block lg:w-72 order-3">
            <InfoPanel distance={detectorDistance} />

            <div className="mt-4 card-dark rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-2">
                Why This Matters
              </h3>
              <div className="text-sm text-[var(--foreground-muted)] space-y-2">
                <p>
                  In <strong>brachytherapy</strong>, dose drops incredibly fast near the source.
                  1cm → 2cm cuts dose by 75%!
                </p>
                <p>
                  For <strong>radiation safety</strong>, every step back significantly reduces exposure.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Challenges - below canvas */}
          <div className="lg:hidden order-3">
            <ChallengePanel
              currentDistance={detectorDistance}
              onChallengeComplete={handleChallengeComplete}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 lg:mt-8 text-center">
          <p className="text-xs md:text-sm text-[var(--foreground-muted)]">
            Drag the blue detector to explore
          </p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]/50">
            I = I₀ / r²
          </p>
        </footer>
      </main>
    </div>
  );
}
