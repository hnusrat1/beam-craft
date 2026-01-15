'use client';

import { useState, useCallback } from 'react';
import { Beam, ViewSettings, DEFAULT_ISODOSE_LEVELS } from '../lib/types';
import { BEAM_PRESETS, getNextBeamColor } from '../data/presets';
import BeamCanvas from '../components/BeamCanvas';
import BeamControls from '../components/BeamControls';
import BeamList from '../components/BeamList';
import PresetButtons from '../components/PresetButtons';
import VisualizationToggle from '../components/VisualizationToggle';
import DoseStats from '../components/DoseStats';
import { calculateDoseGrid, normalizeDoseGrid, getIsocenterDose } from '../lib/physics/doseCalculation';

export default function Home() {
  // Beam state
  const [beams, setBeams] = useState<Beam[]>([]);
  const [selectedBeamId, setSelectedBeamId] = useState<string | null>(null);

  // View settings
  const [settings, setSettings] = useState<ViewSettings>({
    showColorwash: true,
    showIsodoseLines: true,
    showGrid: false,
    showCrosshair: true,
    colorwashOpacity: 0.7,
    isodoseLevels: DEFAULT_ISODOSE_LEVELS,
  });

  // Get selected beam
  const selectedBeam = beams.find((b) => b.id === selectedBeamId) || null;

  // Calculate max dose for stats
  const maxDose = beams.length > 0
    ? (() => {
        const rawGrid = calculateDoseGrid(beams);
        const isocenterDose = getIsocenterDose(beams);
        const normalized = normalizeDoseGrid(rawGrid, isocenterDose || rawGrid.maxDose);
        return normalized.maxDose;
      })()
    : 0;

  // Add beam at gantry angle
  const handleAddBeam = useCallback((gantryAngle: number) => {
    const newBeam: Beam = {
      id: `beam-${Date.now()}`,
      gantryAngle,
      weight: 1.0,
      fieldWidth: 10,
      energy: '6MV',
      color: getNextBeamColor(beams),
      isSelected: false,
    };
    setBeams((prev) => [...prev, newBeam]);
    setSelectedBeamId(newBeam.id);
  }, [beams]);

  // Select beam
  const handleSelectBeam = useCallback((id: string | null) => {
    setSelectedBeamId(id);
    setBeams((prev) =>
      prev.map((b) => ({
        ...b,
        isSelected: b.id === id,
      }))
    );
  }, []);

  // Update beam
  const handleUpdateBeam = useCallback((id: string, updates: Partial<Beam>) => {
    setBeams((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  // Delete beam
  const handleDeleteBeam = useCallback((id: string) => {
    setBeams((prev) => prev.filter((b) => b.id !== id));
    if (selectedBeamId === id) {
      setSelectedBeamId(null);
    }
  }, [selectedBeamId]);

  // Clear all beams
  const handleClearAll = useCallback(() => {
    setBeams([]);
    setSelectedBeamId(null);
  }, []);

  // Load preset
  const handleLoadPreset = useCallback((presetId: string) => {
    const preset = BEAM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newBeams: Beam[] = preset.beams.map((b, i) => ({
      ...b,
      id: `beam-${Date.now()}-${i}`,
      isSelected: false,
    }));

    setBeams(newBeams);
    setSelectedBeamId(null);
  }, []);

  // Update settings
  const handleUpdateSettings = useCallback((updates: Partial<ViewSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="text-[var(--accent)]">Beam</span>Craft
        </h1>
        <p className="text-[var(--foreground-muted)] text-sm">
          Interactive radiation beam simulator for education
        </p>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Presets and List */}
          <div className="lg:w-64 space-y-4 order-2 lg:order-1">
            <PresetButtons onLoadPreset={handleLoadPreset} />
            <BeamList
              beams={beams}
              selectedBeamId={selectedBeamId}
              onSelectBeam={handleSelectBeam}
              onDeleteBeam={handleDeleteBeam}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <BeamCanvas
              beams={beams}
              settings={settings}
              onAddBeam={handleAddBeam}
              onSelectBeam={handleSelectBeam}
            />
          </div>

          {/* Right sidebar - Controls and Settings */}
          <div className="lg:w-64 space-y-4 order-3">
            <DoseStats maxDose={maxDose} beamCount={beams.length} />
            <BeamControls
              beam={selectedBeam}
              onUpdateBeam={handleUpdateBeam}
              onDeleteBeam={handleDeleteBeam}
            />
            <VisualizationToggle
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          </div>
        </div>

        {/* Footer instructions */}
        <footer className="mt-8 text-center text-sm text-[var(--foreground-muted)]">
          <p>Click on the patient perimeter to add beams. Select beams to adjust weight, field width, and energy.</p>
          <p className="mt-2 text-xs opacity-60">
            Educational tool - not for clinical use. Physics model uses analytical approximations.
          </p>
        </footer>
      </main>
    </div>
  );
}
