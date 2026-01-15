'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ParticleSystem, getParticleOpacity } from '@/lib/particles';

interface ParticleCanvasProps {
  detectorDistance: number;
  onDetectorMove: (distance: number) => void;
}

const BASE_CANVAS_SIZE = 400;
const PIXELS_PER_CM = 24;
const DETECTOR_RADIUS = 18;

export default function ParticleCanvas({
  detectorDistance,
  onDetectorMove,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [detectorAngle, setDetectorAngle] = useState(-Math.PI / 2);
  const [canvasSize, setCanvasSize] = useState(BASE_CANVAS_SIZE);
  const [scale, setScale] = useState(1);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const parentWidth = container.parentElement?.clientWidth || window.innerWidth;
      const maxSize = Math.min(parentWidth - 32, BASE_CANVAS_SIZE);
      const newSize = Math.max(280, maxSize);
      setCanvasSize(newSize);
      setScale(newSize / BASE_CANVAS_SIZE);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const sourceX = canvasSize / 2;
  const sourceY = canvasSize / 2;
  const scaledPixelsPerCm = PIXELS_PER_CM * scale;
  const scaledDetectorRadius = DETECTOR_RADIUS * scale;

  // Initialize particle system
  useEffect(() => {
    particleSystemRef.current = new ParticleSystem({
      sourceX: sourceX,
      sourceY: sourceY,
      emissionRate: 3,        // Reduced from 8
      particleSpeed: 2 * scale,
      particleLife: 100,
      particleSize: 1.5 * scale,  // Smaller particles
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sourceX, sourceY, scale]);

  // Calculate detector position
  const getDetectorPosition = useCallback(() => {
    const pixelDistance = detectorDistance * scaledPixelsPerCm;
    return {
      x: sourceX + Math.cos(detectorAngle) * pixelDistance,
      y: sourceY + Math.sin(detectorAngle) * pixelDistance,
    };
  }, [detectorDistance, detectorAngle, sourceX, sourceY, scaledPixelsPerCm]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const ps = particleSystemRef.current;
      if (!ps) return;

      // Update source position for responsive
      ps.config.sourceX = sourceX;
      ps.config.sourceY = sourceY;

      const detector = getDetectorPosition();
      ps.update(detector.x, detector.y, scaledDetectorRadius);

      // Clear canvas
      ctx.fillStyle = '#0a0f1a';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Draw distance rings (fewer on mobile)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      const ringStep = canvasSize < 350 ? 2 : 1;
      for (let d = ringStep; d <= 12; d += ringStep) {
        ctx.beginPath();
        ctx.arc(sourceX, sourceY, d * scaledPixelsPerCm, 0, Math.PI * 2);
        ctx.stroke();

        // Distance labels (fewer on mobile)
        if (d % (canvasSize < 350 ? 4 : 2) === 0) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
          ctx.font = `${10 * scale}px system-ui`;
          ctx.fillText(`${d}`, sourceX + d * scaledPixelsPerCm + 3, sourceY - 3);
        }
      }

      // Draw particles - subtle and small
      for (const particle of ps.particles) {
        const opacity = getParticleOpacity(particle) * 0.6;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${opacity})`;
        ctx.fill();
      }

      // Draw source (smaller, subtler glow)
      const glowSize = 20 * scale;
      const sourceGlow = ctx.createRadialGradient(
        sourceX, sourceY, 0,
        sourceX, sourceY, glowSize
      );
      sourceGlow.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
      sourceGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.3)');
      sourceGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sourceGlow;
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Source center
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Draw detector
      const detectorGlowSize = scaledDetectorRadius + 8;
      const detectorGlow = ctx.createRadialGradient(
        detector.x, detector.y, 0,
        detector.x, detector.y, detectorGlowSize
      );
      detectorGlow.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
      detectorGlow.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
      detectorGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = detectorGlow;
      ctx.beginPath();
      ctx.arc(detector.x, detector.y, detectorGlowSize, 0, Math.PI * 2);
      ctx.fill();

      // Detector body
      ctx.beginPath();
      ctx.arc(detector.x, detector.y, scaledDetectorRadius, 0, Math.PI * 2);
      ctx.fillStyle = isDragging ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.6)';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // Detector crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5 * scale;
      const crossSize = 6 * scale;
      ctx.beginPath();
      ctx.moveTo(detector.x - crossSize, detector.y);
      ctx.lineTo(detector.x + crossSize, detector.y);
      ctx.moveTo(detector.x, detector.y - crossSize);
      ctx.lineTo(detector.x, detector.y + crossSize);
      ctx.stroke();

      // Dashed line from source to detector
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(detector.x, detector.y);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [getDetectorPosition, isDragging, canvasSize, sourceX, sourceY, scale, scaledPixelsPerCm, scaledDetectorRadius]);

  // Get coordinates from event (mouse or touch)
  const getEventCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, [canvasSize]);

  // Start dragging
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const coords = getEventCoords(e);
    if (!coords) return;

    const detector = getDetectorPosition();
    const dx = coords.x - detector.x;
    const dy = coords.y - detector.y;

    if (Math.sqrt(dx * dx + dy * dy) < scaledDetectorRadius + 15) {
      e.preventDefault();
      setIsDragging(true);
    }
  }, [getDetectorPosition, getEventCoords, scaledDetectorRadius]);

  // Move detector
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const coords = getEventCoords(e);
    if (!coords) return;

    e.preventDefault();

    const dx = coords.x - sourceX;
    const dy = coords.y - sourceY;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const distanceCm = Math.max(0.5, Math.min(12, pixelDistance / scaledPixelsPerCm));

    setDetectorAngle(angle);
    onDetectorMove(distanceCm);
  }, [isDragging, getEventCoords, onDetectorMove, sourceX, sourceY, scaledPixelsPerCm]);

  // Stop dragging
  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-2xl touch-none"
          style={{
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.08), inset 0 0 40px rgba(0, 0, 0, 0.4)',
            cursor: isDragging ? 'grabbing' : 'grab',
            maxWidth: '100%',
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        <div className="absolute bottom-3 left-3 text-xs text-[var(--foreground-muted)] bg-black/60 px-2 py-1 rounded">
          Drag detector to explore
        </div>
      </div>
    </div>
  );
}
