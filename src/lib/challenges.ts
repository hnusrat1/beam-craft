// Challenge System for Inverse Square Explorer

export interface Challenge {
  id: string;
  level: number;
  title: string;
  description: string;
  prompt: string;
  targetDistance: number;  // cm
  tolerance: number;       // acceptable error in cm
  hint: string;
  explanation: string;
  points: number;
}

export const CHALLENGES: Challenge[] = [
  // Level 1: Basic Understanding
  {
    id: 'half-intensity',
    level: 1,
    title: 'Half Intensity',
    description: 'Find where intensity is 50%',
    prompt: 'The source intensity is 100% at 1 cm. Move the detector to where the intensity is exactly 50%.',
    targetDistance: Math.sqrt(2), // 1.414 cm
    tolerance: 0.1,
    hint: 'To halve the intensity, you need to multiply the distance by √2',
    explanation: 'I = 1/r². For I = 0.5, r = √2 ≈ 1.41 cm',
    points: 100,
  },
  {
    id: 'quarter-intensity',
    level: 1,
    title: 'Quarter Intensity',
    description: 'Find where intensity is 25%',
    prompt: 'Move to where intensity drops to 25% of the value at 1 cm.',
    targetDistance: 2,
    tolerance: 0.1,
    hint: 'Double the distance = quarter the intensity',
    explanation: 'I = 1/r². For I = 0.25, r = 2 cm. This is the fundamental "double = quarter" rule!',
    points: 100,
  },

  // Level 2: Double Trouble
  {
    id: 'double-from-2',
    level: 2,
    title: 'Double Trouble',
    description: 'Apply the rule from 2cm',
    prompt: 'You\'re at 2 cm (25% intensity). Move to where intensity is 1/4 of your current intensity.',
    targetDistance: 4,
    tolerance: 0.15,
    hint: 'Double the distance again!',
    explanation: 'From 2cm to 4cm doubles the distance, quartering the intensity from 25% to 6.25%',
    points: 150,
  },
  {
    id: 'ninth-intensity',
    level: 2,
    title: 'The Rule of Nine',
    description: 'Triple distance effect',
    prompt: 'Find where intensity is exactly 1/9 (11.1%) of the reference.',
    targetDistance: 3,
    tolerance: 0.1,
    hint: 'What happens when you triple the distance?',
    explanation: 'Triple distance = (1/3)² = 1/9 intensity. Distance = 3 cm.',
    points: 150,
  },

  // Level 3: Safety Zone
  {
    id: 'safety-zone',
    level: 3,
    title: 'Safety Zone',
    description: 'Clinical safety calculation',
    prompt: 'Dose rate at 1m is 100 mGy/hr. Find a safe distance where dose rate is below 2 mGy/hr.',
    targetDistance: 707, // sqrt(50) * 100 = 707 cm
    tolerance: 20,
    hint: 'You need dose to drop by factor of 50. What distance gives 1/50 intensity?',
    explanation: 'Need I < 2/100 = 0.02. r = 1/√0.02 = √50 ≈ 7.07 m',
    points: 200,
  },
  {
    id: 'fluoro-step-back',
    level: 3,
    title: 'Step Back',
    description: 'How much does one step help?',
    prompt: 'You\'re 1m from a scatter source. Step back to 2m. What percentage reduction did you achieve?',
    targetDistance: 200,
    tolerance: 5,
    hint: 'Compare intensity at 1m vs 2m',
    explanation: 'At 2m, intensity is 1/4 of 1m. You reduced exposure by 75%!',
    points: 200,
  },

  // Level 4: Brachytherapy Planning
  {
    id: 'brachy-hotspot',
    level: 4,
    title: 'Hot Zone',
    description: 'Brachytherapy dose gradient',
    prompt: 'If prescription dose is at 2 cm, what\'s the dose at 0.5 cm from the source?',
    targetDistance: 0.5,
    tolerance: 0.05,
    hint: 'Compare (2/0.5)² to find dose ratio',
    explanation: 'Dose at 0.5cm = (2/0.5)² = 16x prescription! This is why source positioning is critical.',
    points: 300,
  },
  {
    id: 'brachy-falloff',
    level: 4,
    title: 'Rapid Falloff',
    description: 'Understand brachytherapy gradients',
    prompt: 'At what distance does the dose drop to 10% of the dose at 1 cm?',
    targetDistance: Math.sqrt(10), // 3.16 cm
    tolerance: 0.15,
    hint: 'For 10% intensity, what r gives 1/r² = 0.1?',
    explanation: 'r = √10 ≈ 3.16 cm. In just 2 cm, dose drops 90%!',
    points: 300,
  },

  // Level 5: Speed Challenges
  {
    id: 'speed-1',
    level: 5,
    title: 'Quick Math 1',
    description: 'Fast calculation',
    prompt: 'Move to 1/16 intensity. Go!',
    targetDistance: 4,
    tolerance: 0.1,
    hint: '1/16 = (1/4)² = (1/2)⁴',
    explanation: '1/r² = 1/16 → r = 4 cm',
    points: 150,
  },
  {
    id: 'speed-2',
    level: 5,
    title: 'Quick Math 2',
    description: 'Fast calculation',
    prompt: 'Move to exactly 4% intensity.',
    targetDistance: 5,
    tolerance: 0.1,
    hint: '4% = 1/25 = (1/5)²',
    explanation: '1/r² = 0.04 → r = 5 cm',
    points: 150,
  },
  {
    id: 'speed-3',
    level: 5,
    title: 'Quick Math 3',
    description: 'Fast calculation',
    prompt: 'Move to exactly 1% intensity.',
    targetDistance: 10,
    tolerance: 0.2,
    hint: '1% = 1/100 = (1/10)²',
    explanation: '1/r² = 0.01 → r = 10 cm',
    points: 150,
  },
];

export function getChallengesByLevel(level: number): Challenge[] {
  return CHALLENGES.filter(c => c.level === level);
}

export function getNextChallenge(completedIds: string[]): Challenge | null {
  return CHALLENGES.find(c => !completedIds.includes(c.id)) || null;
}

export function checkAnswer(challenge: Challenge, distance: number): boolean {
  return Math.abs(distance - challenge.targetDistance) <= challenge.tolerance;
}

export function calculateScore(completedChallenges: string[]): number {
  return CHALLENGES
    .filter(c => completedChallenges.includes(c.id))
    .reduce((sum, c) => sum + c.points, 0);
}

export const LEVEL_NAMES = [
  '',
  'Basic Understanding',
  'Double Trouble',
  'Safety Zone',
  'Brachytherapy Planning',
  'Speed Round',
];
