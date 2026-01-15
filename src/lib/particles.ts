// Particle System for visualizing inverse square law

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface ParticleSystemConfig {
  sourceX: number;
  sourceY: number;
  emissionRate: number;  // particles per frame
  particleSpeed: number; // pixels per frame
  particleLife: number;  // frames
  particleSize: number;
}

let particleId = 0;

/**
 * Create a new particle at the source position
 */
export function createParticle(config: ParticleSystemConfig): Particle {
  // Random angle for radial emission
  const angle = Math.random() * Math.PI * 2;
  const speed = config.particleSpeed * (0.8 + Math.random() * 0.4); // Some variation

  return {
    id: particleId++,
    x: config.sourceX,
    y: config.sourceY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: config.particleLife,
    maxLife: config.particleLife,
    size: config.particleSize * (0.8 + Math.random() * 0.4),
  };
}

/**
 * Update particle position and life
 */
export function updateParticle(particle: Particle): Particle {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    life: particle.life - 1,
  };
}

/**
 * Check if particle is still alive
 */
export function isAlive(particle: Particle): boolean {
  return particle.life > 0;
}

/**
 * Get particle opacity based on remaining life
 */
export function getParticleOpacity(particle: Particle): number {
  return particle.life / particle.maxLife;
}

/**
 * Check if particle is within detector range
 */
export function isInDetector(
  particle: Particle,
  detectorX: number,
  detectorY: number,
  detectorRadius: number
): boolean {
  const dx = particle.x - detectorX;
  const dy = particle.y - detectorY;
  return Math.sqrt(dx * dx + dy * dy) <= detectorRadius;
}

/**
 * Count particles hitting a ring at given distance (for visualization)
 */
export function countParticlesAtDistance(
  particles: Particle[],
  sourceX: number,
  sourceY: number,
  distance: number,
  ringWidth: number = 10
): number {
  return particles.filter(p => {
    const dx = p.x - sourceX;
    const dy = p.y - sourceY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(dist - distance) <= ringWidth / 2;
  }).length;
}

/**
 * Particle system manager
 */
export class ParticleSystem {
  particles: Particle[] = [];
  config: ParticleSystemConfig;
  detectorHits: number = 0;
  totalEmitted: number = 0;

  constructor(config: ParticleSystemConfig) {
    this.config = config;
  }

  setSource(x: number, y: number) {
    this.config.sourceX = x;
    this.config.sourceY = y;
  }

  update(detectorX: number, detectorY: number, detectorRadius: number) {
    // Emit new particles
    for (let i = 0; i < this.config.emissionRate; i++) {
      this.particles.push(createParticle(this.config));
      this.totalEmitted++;
    }

    // Update existing particles
    this.particles = this.particles
      .map(updateParticle)
      .filter(isAlive);

    // Count detector hits
    const newHits = this.particles.filter(p =>
      isInDetector(p, detectorX, detectorY, detectorRadius)
    ).length;
    this.detectorHits = newHits;
  }

  getHitRate(): number {
    if (this.totalEmitted === 0) return 0;
    // Smoothed hit rate based on current particles
    return this.detectorHits / this.config.emissionRate;
  }

  reset() {
    this.particles = [];
    this.detectorHits = 0;
    this.totalEmitted = 0;
  }
}
