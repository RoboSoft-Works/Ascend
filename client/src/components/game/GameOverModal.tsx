import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Home, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateScore } from '@/hooks/use-scores';

interface GameOverModalProps {
  score: number;
  perfectStreak: number;
  onRestart: () => void;
}

export function GameOverModal({ score, perfectStreak, onRestart }: GameOverModalProps) {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const createScore = useCreateScore();

  // Check local storage records
  useEffect(() => {
    const saved = localStorage.getItem('ascend_highscores');
    if (saved) {
      try {
        const scores = JSON.parse(saved);
        if (scores.length === 0 || score > scores[0].score) {
          setIsNewRecord(true);
        }
      } catch (e) {}
    } else if (score > 0) {
      setIsNewRecord(true); // First game ever
    }
    
    // Attempt to load previous name
    const savedName = localStorage.getItem('ascend_player_name');
    if (savedName) setName(savedName);
  }, [score]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || hasSubmitted) return;

    localStorage.setItem('ascend_player_name', name.trim());

    // Track total games
    const currentGames = localStorage.getItem('ascend_total_games') ? parseInt(localStorage.getItem('ascend_total_games')!) : 0;
    localStorage.setItem('ascend_total_games', String(currentGames + 1));

    // Save to local storage leaderboard
    const newEntry = { score, perfectStreak, date: new Date().toISOString(), name: name.trim() };
    const saved = localStorage.getItem('ascend_highscores');
    let localScores = saved ? JSON.parse(saved) : [];
    localScores.push(newEntry);
    localScores.sort((a: any, b: any) => b.score - a.score);
    localScores = localScores.slice(0, 5); // Keep top 5
    localStorage.setItem('ascend_highscores', JSON.stringify(localScores));

    // Save to server
    try {
      await createScore.mutateAsync({
        playerName: name.trim(),
        score,
        perfectStreak
      });
    } catch (e) {
      console.error("Failed to sync to server", e);
      // We still submitted locally, so it's fine
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
        className="bg-card w-full max-w-sm rounded-3xl p-8 border border-border shadow-2xl flex flex-col items-center"
      >
        <h2 className="text-4xl font-black mb-2 text-glow-gold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
          GAME OVER
        </h2>
        
        {isNewRecord && (
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold mb-6 tracking-widest uppercase"
          >
            New Record!
          </motion.div>
        )}

        <div className="w-full bg-background/50 rounded-2xl p-6 mb-8 border border-white/5 flex flex-col items-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Final Score</div>
          <div className="text-6xl font-black text-white mb-4">{score}</div>
          
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Best Streak: {perfectStreak}</span>
          </div>
        </div>

        {!hasSubmitted ? (
          <form onSubmit={handleSubmit} className="w-full mb-6">
            <div className="flex gap-2">
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-background border-primary/30 focus-visible:ring-primary h-12 rounded-xl"
                maxLength={15}
                required
                autoFocus
              />
              <Button 
                type="submit" 
                variant="gold" 
                className="px-6"
                disabled={!name.trim() || createScore.isPending}
              >
                {createScore.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Save"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-green-400 font-semibold mb-6 flex items-center gap-2">
            Score Saved!
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <Button size="lg" onClick={onRestart} className="w-full text-lg">
            <RotateCcw className="w-6 h-6 mr-2" />
            Play Again
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setLocation('/leaderboard')}
            className="w-full"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Leaderboard
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
