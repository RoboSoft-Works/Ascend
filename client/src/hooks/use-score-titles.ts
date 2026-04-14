import { useMemo } from 'react';

interface ScoreTitle {
  title: string;
  subtitle: string;
  color: string;
  minScore: number;
  animation?: string;
}

export const SCORE_TITLES: ScoreTitle[] = [
  {
    title: "ROOKIE",
    subtitle: "Getting Started",
    color: "from-blue-400 to-blue-600",
    minScore: 500,
  },
  {
    title: "APPRENTICE",
    subtitle: "Learning the Ropes",
    color: "from-green-400 to-green-600",
    minScore: 1000,
  },
  {
    title: "SKILLED",
    subtitle: "Finding Your Flow",
    color: "from-purple-400 to-purple-600",
    minScore: 2500,
  },
  {
    title: "EXPERT",
    subtitle: "Master of Precision",
    color: "from-indigo-400 to-indigo-600",
    minScore: 5000,
  },
  {
    title: "MASTER",
    subtitle: "Unstoppable Force",
    color: "from-pink-400 to-pink-600",
    minScore: 10000,
  },
  {
    title: "LEGEND",
    subtitle: "Beyond Excellence",
    color: "from-yellow-400 to-amber-600",
    minScore: 15000,
  },
  {
    title: "MYTHIC",
    subtitle: "Transcendent Skill",
    color: "from-red-400 to-orange-600",
    minScore: 25000,
  },
  {
    title: "GODLIKE",
    subtitle: "Perfection Achieved",
    color: "from-purple-500 via-pink-500 to-red-500",
    minScore: 40000,
    animation: "animate-pulse",
  },
  {
    title: "IMMORTAL",
    subtitle: "Beyond Human Limits",
    color: "from-yellow-300 via-red-500 to-pink-500",
    minScore: 60000,
    animation: "animate-bounce",
  },
  {
    title: "ASCENDED",
    subtitle: "You Are The Game",
    color: "from-cyan-400 via-blue-500 to-purple-600",
    minScore: 100000,
    animation: "animate-spin",
  },
];

export function useScoreTitle(score: number) {
  const currentTitle = useMemo(() => {
    // Find the highest title the player has achieved
    const achievedTitle = SCORE_TITLES.reduce((highest, title) => {
      return score >= title.minScore && title.minScore > highest.minScore ? title : highest;
    }, SCORE_TITLES[0]);

    return achievedTitle;
  }, [score]);

  const nextTitle = useMemo(() => {
    // Find the next title to achieve
    const currentIndex = SCORE_TITLES.findIndex(title => title.title === currentTitle.title);
    return SCORE_TITLES[currentIndex + 1] || null;
  }, [currentTitle]);

  const progressToNext = useMemo(() => {
    if (!nextTitle) return 100;
    const currentRange = nextTitle.minScore - currentTitle.minScore;
    const progress = score - currentTitle.minScore;
    return Math.min(100, (progress / currentRange) * 100);
  }, [score, currentTitle, nextTitle]);

  const isNewTitle = useMemo(() => {
    // Check if this is a newly achieved title (within last 100 points)
    const scoreSinceTitle = score - currentTitle.minScore;
    return scoreSinceTitle >= 0 && scoreSinceTitle <= 100;
  }, [score, currentTitle]);

  return {
    currentTitle,
    nextTitle,
    progressToNext,
    isNewTitle,
    hasMoreTitles: nextTitle !== null,
  };
}
