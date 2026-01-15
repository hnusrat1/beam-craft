'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ParticleSystem, getParticleOpacity } from '@/lib/particles';

interface ParticleCanvasProps {
  detectorDistance: number;
  onDetectorMove: (distance: number) => void;
  sourceX?: number;
  sourceY?: number;
}

const CANVAS_SIZE = 500;
const SOURCE_X = CANVAS_SIZE / 2;
const SOURCE_Y = CANVAS_SIZE / 2;
const PIXELS_PER_CM = 30;
const DETECTOR_RADIUS = 20;

export default function ParticleCanvas({
  detectorDistance,
  onDetectorMove,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [detectorAngle, setDetectorAngle] = useState(-Math.PI / 2); // Start at top

  // Initialize particle system
  useEffect(() => {
    particleSystemRef.current = new ParticleSystem({
      sourceX: SOURCE_X,
      sourceY: SOURCE_Y,
      emissionRate: 8,
      particleSpeed: 3,
      particleLife: 120,
      particleSize: 3,
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calculate detector position from distance and angle
  const getDetectorPosition = useCallback(() => {
    const pixelDistance = detectorDistance * PIXELS_PER_CM;
    return {
      x: SOURCE_X + Math.cos(detectorAngle) * pixelDistance,
      y: SOURCE_Y + Math.sin(detectorAngle) * pixelDistance,
    };
  }, [detectorDistance, detectorAngle]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const ps = particleSystemRef.current;
      if (!ps) return;

      const detector = getDetectorPosition();

      // Update particles
      ps.update(detector.x, detector.y, DETECTOR_RADIUS);

      // Clear canvas
      ctx.fillStyle = '#0a0f1a';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw distance rings
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for (let d = 1; d <= 15; d++) {
        ctx.beginPath();
        ctx.arc(SOURCE_X, SOURCE_Y, d * PIXELS_PER_CM, 0, Math.PI * 2);
        ctx.stroke();

        // Distance labels
        if (d % 2 === 0) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.font = '10px system-ui';
          ctx.fillText(`${d}cm`, SOURCE_X + d * PIXELS_PER_CM + 5, SOURCE_Y - 5);
        }
      }

      // Draw particles
      for (const particle of ps.particles) {
        const opacity = getParticleOpacity(particle);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${opacity * 0.8})`;
        ctx.fill();
      }

      // Draw source (glowing point)
      const sourceGlow = ctx.createRadialGradient(
        SOURCE_X, SOURCE_Y, 0,
        SOURCE_X, SOURCE_Y, 30
      );
      sourceGlow.addColorStop(0, 'rgba(251, 191, 36, 1)');
      sourceGlow.addColorStop(0.3, 'rgba(251, 191, 36, 0.5)');
      sourceGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sourceGlow;
      ctx.beginPath();
      ctx.arc(SOURCE_X, SOURCE_Y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Source center
      ctx.beginPath();
      ctx.arc(SOURCE_X, SOURCE_Y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Draw detector
      const detectorGlow = ctx.createRadialGradient(
        detector.x, detector.y, 0,
        detector.x, detector.y, DETECTOR_RADIUS + 10
      );
      detectorGlow.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      detectorGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
      detectorGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = detectorGlow;
      ctx.beginPath();
      ctx.arc(detector.x, detector.y, DETECTOR_RADIUS + 10, 0, Math.PI * 2);
      ctx.fill();

      // Detector body
      ctx.beginPath();
      ctx.arc(detector.x, detector.y, DETECTOR_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = isDragging ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.7)';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Detector icon (circle with lines)
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(detector.x - 8, detector.y);
      ctx.lineTo(detector.x + 8, detector.y);
      ctx.moveTo(detector.x, detector.y - 8);
      ctx.lineTo(detector.x, detector.y + 8);
      ctx.stroke();

      // Draw line from source to detector
      ctx.beginPath();
      ctx.moveTo(SOURCE_X, SOURCE_Y);
      ctx.lineTo(detector.x, detector.y);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
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
  }, [getDetectorPosition, isDragging]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const detector = getDetectorPosition();
    const dx = x - detector.x;
    const dy = y - detector.y;

    if (Math.sqrt(dx * dx + dy * dy) < DETECTOR_RADIUS + 10) {
      setIsDragging(true);
    }
  }, [getDetectorPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate distance and angle from source
    const dx = x - SOURCE_X;
    const dy = y - SOURCE_Y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Convert to cm and clamp
    const distanceCm = Math.max(0.5, Math.min(15, pixelDistance / PIXELS_PER_CM));

    setDetectorAngle(angle);
    onDetectorMove(distanceCm);
  }, [isDragging, onDetectorMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="rounded-2xl cursor-grab active:cursor-grabbing"
        style={{ boxShadow: '0 0 60px rgba(251, 191, 36, 0.1), inset 0 0 60px rgba(0, 0, 0, 0.5)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-4 left-4 text-xs text-[var(--foreground-muted)] bg-black/50 px-2 py-1 rounded">
        Drag the detector to explore
      </div>
    </div>
  );
}
