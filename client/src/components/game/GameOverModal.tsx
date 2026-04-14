import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useScores, useCreateScore } from '@/hooks/use-scores';
import { useScoreTitle } from '@/hooks/use-score-titles';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Trophy, Star, Crown } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  perfectStreak: number;
  onRestart: () => void;
}

export function GameOverModal({ score, perfectStreak, onRestart }: GameOverModalProps) {
  const [, setLocation] = useLocation();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const createScore = useCreateScore();
  const { currentTitle, isNewTitle } = useScoreTitle(score);

  // Auto-submit score when modal opens
  useEffect(() => {
    if (!hasSubmitted && score > 0) {
      submitScore();
    }
  }, [score]);

  const submitScore = async () => {
    if (hasSubmitted) return;

    // Track total games
    const currentGames = localStorage.getItem('ascend_total_games') ? parseInt(localStorage.getItem('ascend_total_games')!) : 0;
    localStorage.setItem('ascend_total_games', String(currentGames + 1));

    // Save to local storage leaderboard
    const newEntry = { 
      score, 
      perfectStreak, 
      date: new Date().toISOString(), 
      playerName: currentTitle.title,
      title: currentTitle.title,
      subtitle: currentTitle.subtitle
    };
    const saved = localStorage.getItem('ascend_highscores');
    let localScores = saved ? JSON.parse(saved) : [];
    localScores.push(newEntry);
    localScores.sort((a: any, b: any) => b.score - a.score);
    localScores = localScores.slice(0, 10); // Keep top 10
    localStorage.setItem('ascend_highscores', JSON.stringify(localScores));

    // Check if it's a new record
    if (localScores.length === 0 || score > localScores[0].score) {
      setIsNewRecord(true);
    }

    // Save to server (only if not in Capacitor or if server is available)
    if (!window.location.protocol.includes('capacitor')) {
      try {
        await createScore.mutateAsync({
          playerName: currentTitle.title,
          score,
          perfectStreak
        });
      } catch (e) {
        console.error("Failed to sync to server", e);
      }
    }

    setHasSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="bg-card w-full max-w-sm sm:max-w-md mx-auto rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto"
      >
        <h2 className="game-over-title font-black mb-2 text-glow-gold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent text-center">
          GAME OVER
        </h2>
        
        {isNewRecord && (
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold mb-4 tracking-widest uppercase"
          >
            New Record!
          </motion.div>
        )}

        {isNewTitle && score > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
              <motion.div
                className={`section-title font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTitle.color} text-center`}
                whileHover={{ scale: 1.05 }}
              >
                {currentTitle.title}
              </motion.div>
              <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
            <motion.p 
              className="text-center text-muted-foreground font-medium text-sm"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentTitle.subtitle}
            </motion.p>
          </motion.div>
        )}

        <div className="w-full bg-background/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/5 flex flex-col items-center">
          <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">Final Score</div>
          <div className="text-4xl sm:text-6xl font-black text-white mb-3 sm:mb-4">{score}</div>
          
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-semibold">Best Streak: {perfectStreak}</span>
          </div>
        </div>

        {hasSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 font-semibold mb-6 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Score Saved!
          </motion.div>
        )}

        <div className="w-full flex flex-col gap-2 sm:gap-3">
          <Button size="lg" onClick={onRestart} className="w-full text-base sm:text-lg h-12 sm:h-14 rounded-xl">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Play Again
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setLocation('/leaderboard')}
            className="w-full h-12 sm:h-14 rounded-xl text-base sm:text-lg"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Leaderboard
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
