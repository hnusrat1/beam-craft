'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Beam, DoseGrid, ViewSettings, CANVAS_SIZE, ISODOSE_COLORS, DEFAULT_ISODOSE_LEVELS } from '../lib/types';
import { calculateDoseGrid, normalizeDoseGrid, getIsocenterDose } from '../lib/physics/doseCalculation';
import { generateAllIsodoseLines } from '../lib/rendering/marchingSquares';
import {
  renderPatientOutline,
  renderCrosshair,
  renderGrid,
  renderColorwash,
  renderIsodoseLines,
  renderBeamIndicators,
  getGantryAngleFromClick,
  findBeamAtPosition,
} from '../lib/rendering/canvasRenderer';

interface BeamCanvasProps {
  beams: Beam[];
  settings: ViewSettings;
  onAddBeam: (gantryAngle: number) => void;
  onSelectBeam: (beamId: string | null) => void;
}

export default function BeamCanvas({ beams, settings, onAddBeam, onSelectBeam }: BeamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate dose grid (memoized)
  const doseGrid = useMemo(() => {
    if (beams.length === 0) {
      return { width: 0, height: 0, data: new Float32Array(0), maxDose: 0 };
    }
    const rawGrid = calculateDoseGrid(beams);
    const isocenterDose = getIsocenterDose(beams);
    return normalizeDoseGrid(rawGrid, isocenterDose || rawGrid.maxDose);
  }, [beams]);

  // Generate isodose lines (memoized)
  const isodoseLines = useMemo(() => {
    if (doseGrid.maxDose === 0) return [];
    return generateAllIsodoseLines(doseGrid, settings.isodoseLevels, ISODOSE_COLORS);
  }, [doseGrid, settings.isodoseLevels]);

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Render layers in order
    renderPatientOutline(ctx);

    if (settings.showGrid) {
      renderGrid(ctx);
    }

    if (settings.showColorwash && doseGrid.maxDose > 0) {
      renderColorwash(ctx, doseGrid, settings.colorwashOpacity);
    }

    if (settings.showIsodoseLines) {
      renderIsodoseLines(ctx, isodoseLines);
    }

    if (settings.showCrosshair) {
      renderCrosshair(ctx);
    }

    renderBeamIndicators(ctx, beams);
  }, [beams, doseGrid, isodoseLines, settings]);

  // Re-render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  // Handle canvas click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Check if clicking on existing beam
    const clickedBeam = findBeamAtPosition(e.clientX, e.clientY, rect, beams);
    if (clickedBeam) {
      onSelectBeam(clickedBeam.id);
      return;
    }

    // Check if clicking on perimeter to add new beam
    const gantryAngle = getGantryAngleFromClick(e.clientX, e.clientY, rect);
    if (gantryAngle !== null) {
      onAddBeam(gantryAngle);
    } else {
      // Clicked inside patient - deselect
      onSelectBeam(null);
    }
  }, [beams, onAddBeam, onSelectBeam]);

  return (
    <div className="canvas-container" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleClick}
        className="cursor-crosshair"
        style={{ display: 'block' }}
      />
    </div>
  );
}
