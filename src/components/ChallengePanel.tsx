'use client';

import { useState, useEffect } from 'react';
import {
  Challenge,
  CHALLENGES,
  LEVEL_NAMES,
  checkAnswer,
  calculateScore,
  getNextChallenge,
} from '@/lib/challenges';

interface ChallengePanelProps {
  currentDistance: number;
  onChallengeComplete: (challengeId: string) => void;
}

export default function ChallengePanel({
  currentDistance,
  onChallengeComplete,
}: ChallengePanelProps) {
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('isq-progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCompletedChallenges(parsed.completed || []);
    }
    setCurrentChallenge(CHALLENGES[0]);
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem('isq-progress', JSON.stringify({
      completed: completedChallenges,
    }));
  }, [completedChallenges]);

  const handleCheckAnswer = () => {
    if (!currentChallenge) return;

    const isCorrect = checkAnswer(currentChallenge, currentDistance);

    if (isCorrect) {
      setFeedback('correct');
      setShowExplanation(true);

      setTimeout(() => {
        const newCompleted = [...completedChallenges, currentChallenge.id];
        setCompletedChallenges(newCompleted);
        onChallengeComplete(currentChallenge.id);

        // Move to next challenge after delay
        setTimeout(() => {
          const next = getNextChallenge(newCompleted);
          setCurrentChallenge(next);
          setFeedback(null);
          setShowHint(false);
          setShowExplanation(false);
        }, 2000);
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setShowHint(false);
    setShowExplanation(false);
    setFeedback(null);
  };

  const score = calculateScore(completedChallenges);
  const progress = (completedChallenges.length / CHALLENGES.length) * 100;

  return (
    <div className="card-dark rounded-xl p-5 space-y-4">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Challenges</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--accent)]">{score}</div>
          <div className="text-xs text-[var(--foreground-muted)]">points</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-[var(--foreground-muted)]">
          {completedChallenges.length} / {CHALLENGES.length} completed
        </div>
      </div>

      {/* Current Challenge */}
      {currentChallenge && (
        <div
          className={`p-4 rounded-lg transition-all ${
            feedback === 'correct'
              ? 'bg-emerald-500/20 border border-emerald-500'
              : feedback === 'wrong'
              ? 'bg-red-500/20 border border-red-500 animate-shake'
              : 'bg-[var(--background-tertiary)]'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded">
              Level {currentChallenge.level}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              {LEVEL_NAMES[currentChallenge.level]}
            </span>
          </div>

          <h3 className="font-semibold mb-1">{currentChallenge.title}</h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-3">
            {currentChallenge.prompt}
          </p>

          {/* Hint */}
          {showHint && !showExplanation && (
            <div className="text-sm text-amber-400 bg-amber-500/10 p-2 rounded mb-3">
              💡 {currentChallenge.hint}
            </div>
          )}

          {/* Explanation (after correct answer) */}
          {showExplanation && (
            <div className="text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded mb-3">
              ✓ {currentChallenge.explanation}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCheckAnswer}
              disabled={feedback === 'correct'}
              className="flex-1 btn-primary py-2 px-4 rounded-lg font-medium disabled:opacity-50"
            >
              {feedback === 'correct' ? '✓ Correct!' : 'Check Answer'}
            </button>
            {!showHint && !showExplanation && (
              <button
                onClick={() => setShowHint(true)}
                className="py-2 px-4 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-tertiary)]/80 text-sm"
              >
                Hint
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-[var(--foreground-muted)]">
            +{currentChallenge.points} points
          </div>
        </div>
      )}

      {/* All Challenges Complete */}
      {!currentChallenge && completedChallenges.length === CHALLENGES.length && (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-xl font-bold text-emerald-400">All Complete!</div>
          <div className="text-sm text-[var(--foreground-muted)]">
            You've mastered the inverse square law
          </div>
        </div>
      )}

      {/* Challenge List */}
      <div className="space-y-2">
        <div className="text-sm text-[var(--foreground-muted)]">All Challenges</div>
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {[1, 2, 3, 4, 5].map(level => (
            <div key={level}>
              <div className="text-xs text-[var(--foreground-muted)] py-1">
                Level {level}: {LEVEL_NAMES[level]}
              </div>
              {CHALLENGES.filter(c => c.level === level).map(challenge => (
                <button
                  key={challenge.id}
                  onClick={() => handleSelectChallenge(challenge)}
                  className={`w-full text-left p-2 rounded text-sm flex items-center justify-between ${
                    completedChallenges.includes(challenge.id)
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : currentChallenge?.id === challenge.id
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                      : 'bg-[var(--background-tertiary)]/50 hover:bg-[var(--background-tertiary)]'
                  }`}
                >
                  <span>{challenge.title}</span>
                  {completedChallenges.includes(challenge.id) && (
                    <span>✓</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
