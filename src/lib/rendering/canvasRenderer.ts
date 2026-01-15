// Multi-layer canvas rendering for dose visualization
import { Beam, DoseGrid, IsodoseLine, ViewSettings, CANVAS_SIZE, PATIENT_RADIUS_CM, SCALE } from '../types';
import { createColorwashFast } from './colorMap';
import { GRID_SIZE } from '../physics/doseCalculation';

/**
 * Render the patient outline (circular cross-section)
 */
export function renderPatientOutline(ctx: CanvasRenderingContext2D): void {
  const center = CANVAS_SIZE / 2;
  const radius = PATIENT_RADIUS_CM * SCALE;

  // Patient body (dark fill)
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
  ctx.fill();

  // Outline
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Render crosshair at isocenter
 */
export function renderCrosshair(ctx: CanvasRenderingContext2D): void {
  const center = CANVAS_SIZE / 2;
  const size = 20;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(center - size, center);
  ctx.lineTo(center + size, center);
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(center, center - size);
  ctx.lineTo(center, center + size);
  ctx.stroke();

  ctx.setLineDash([]);
}

/**
 * Render grid overlay
 */
export function renderGrid(ctx: CanvasRenderingContext2D): void {
  const center = CANVAS_SIZE / 2;
  const radius = PATIENT_RADIUS_CM * SCALE;
  const gridSpacing = 5 * SCALE; // 5cm grid

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  ctx.lineWidth = 1;

  // Clip to patient circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();

  // Vertical lines
  for (let x = center - radius; x <= center + radius; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, center - radius);
    ctx.lineTo(x, center + radius);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = center - radius; y <= center + radius; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(center - radius, y);
    ctx.lineTo(center + radius, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Render dose colorwash
 */
export function renderColorwash(
  ctx: CanvasRenderingContext2D,
  grid: DoseGrid,
  opacity: number = 0.7
): void {
  if (grid.maxDose === 0) return;

  const center = CANVAS_SIZE / 2;
  const radius = PATIENT_RADIUS_CM * SCALE;

  // Create colorwash image at grid resolution
  const imageData = createColorwashFast(grid.data, grid.width, grid.height, opacity);

  // Create temporary canvas at grid resolution
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = grid.width;
  tempCanvas.height = grid.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Clip to patient circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();

  // Scale up and draw
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.restore();
}

/**
 * Render isodose contour lines
 */
export function renderIsodoseLines(
  ctx: CanvasRenderingContext2D,
  lines: IsodoseLine[]
): void {
  const scaleX = CANVAS_SIZE / GRID_SIZE;
  const scaleY = CANVAS_SIZE / GRID_SIZE;

  for (const line of lines) {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const contour of line.contours) {
      if (contour.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(contour[0].x * scaleX, contour[0].y * scaleY);

      for (let i = 1; i < contour.length; i++) {
        ctx.lineTo(contour[i].x * scaleX, contour[i].y * scaleY);
      }

      ctx.stroke();
    }
  }
}

/**
 * Render beam entry indicators around patient perimeter
 */
export function renderBeamIndicators(
  ctx: CanvasRenderingContext2D,
  beams: Beam[],
  onClickCallback?: (beam: Beam) => void
): void {
  const center = CANVAS_SIZE / 2;
  const radius = PATIENT_RADIUS_CM * SCALE + 15; // Outside patient

  for (const beam of beams) {
    const angleRad = (beam.gantryAngle * Math.PI) / 180;
    const x = center + radius * Math.sin(angleRad);
    const y = center - radius * Math.cos(angleRad);

    // Beam source indicator
    const indicatorSize = beam.isSelected ? 8 : 6;

    ctx.beginPath();
    ctx.arc(x, y, indicatorSize, 0, Math.PI * 2);
    ctx.fillStyle = beam.color;
    ctx.fill();

    if (beam.isSelected) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = beam.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, indicatorSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Beam direction line (into patient)
    const lineLength = 25;
    const endX = x - lineLength * Math.sin(angleRad);
    const endY = y + lineLength * Math.cos(angleRad);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = beam.color;
    ctx.lineWidth = beam.isSelected ? 3 : 2;
    ctx.globalAlpha = beam.isSelected ? 1 : 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Gantry angle label
    ctx.font = '10px system-ui';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelRadius = radius + 20;
    const labelX = center + labelRadius * Math.sin(angleRad);
    const labelY = center - labelRadius * Math.cos(angleRad);
    ctx.fillText(`${beam.gantryAngle}°`, labelX, labelY);
  }
}

/**
 * Get gantry angle from click position on canvas
 */
export function getGantryAngleFromClick(
  clickX: number,
  clickY: number,
  canvasRect: DOMRect
): number | null {
  const x = clickX - canvasRect.left;
  const y = clickY - canvasRect.top;

  const center = CANVAS_SIZE / 2;
  const dx = x - center;
  const dy = center - y; // Flip Y axis

  const distance = Math.sqrt(dx * dx + dy * dy);
  const radius = PATIENT_RADIUS_CM * SCALE;

  // Only accept clicks near the perimeter (within 30px)
  if (distance < radius - 30 || distance > radius + 50) {
    return null;
  }

  // Calculate angle (0° = top, clockwise)
  let angle = Math.atan2(dx, dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  return Math.round(angle);
}

/**
 * Find beam near click position
 */
export function findBeamAtPosition(
  clickX: number,
  clickY: number,
  canvasRect: DOMRect,
  beams: Beam[]
): Beam | null {
  const x = clickX - canvasRect.left;
  const y = clickY - canvasRect.top;
  const center = CANVAS_SIZE / 2;
  const radius = PATIENT_RADIUS_CM * SCALE + 15;

  for (const beam of beams) {
    const angleRad = (beam.gantryAngle * Math.PI) / 180;
    const bx = center + radius * Math.sin(angleRad);
    const by = center - radius * Math.cos(angleRad);

    const dist = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
    if (dist < 20) {
      return beam;
    }
  }

  return null;
}
